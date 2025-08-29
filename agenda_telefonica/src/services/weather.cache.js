const { getWeatherByCity } = require('./weather.service');

const CACHE = new Map(); // key -> { t: timestamp, v: response }
const TTL_MS = 5 * 60 * 1000; // 5 minutos

function cacheKey(cidade, uf) {
  return `${(cidade || '').toLowerCase()}|${(uf || '').toUpperCase()}`;
}

async function getWeatherCached({ cidade, uf }) {
  const key = cacheKey(cidade, uf);
  const now = Date.now();

  const hit = CACHE.get(key);
  if (hit && (now - hit.t) < TTL_MS) {
    return hit.v; // retorna do cache
  }

  const resp = await getWeatherByCity({ cidade, uf });
  CACHE.set(key, { t: now, v: resp });
  return resp;
}

module.exports = { getWeatherCached };
