const { getWeatherByCity } = require('./weather.service');

const cache = new Map();
const TTL_MS = 5 * 60 * 1000;   
const NEG_TTL_MS = 30 * 1000;  

async function getWeatherCached({ cidade, uf }) {
  const key = `${(cidade || '').trim().toLowerCase()}|${(uf || '').trim().toUpperCase()}`;
  const now = Date.now();

  const hit = cache.get(key);
  if (hit) {
    const age = now - hit.t;
    if (hit.ok && age < TTL_MS) return hit;
    if (!hit.ok && age < NEG_TTL_MS) return hit;
  }

  try {
    const r = await getWeatherByCity({ cidade, uf });
    const payload = { ok: true, ...r };
    cache.set(key, { ...payload, t: now });
    return payload;
  } catch {
    const payload = { ok: false, error: 'WEATHER_UNAVAILABLE' };
    cache.set(key, { ...payload, t: now });
    return payload; 
  }
}

module.exports = { getWeatherCached };
