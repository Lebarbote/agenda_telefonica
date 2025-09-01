const axios = require('axios');

const BASE_URL = process.env.HG_BASE_URL || 'https://api.hgbrasil.com/weather';
const TIMEOUT = Number(process.env.HG_TIMEOUT_MS || 3000);
const client = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

async function getWeatherByCity({ cidade, uf }) {
  const key = process.env.HG_WEATHER_KEY;
  if (!key) {
    const e = new Error('HG_WEATHER_KEY ausente');
    e.code = 'CONFIG_MISSING';
    throw e;
  }
  const city_name = `${cidade},${uf}`;
  const { data } = await client.get('', { params: { key, format: 'json', city_name } });

  const r = data?.results;
  if (!r || typeof r.temp !== 'number') {
    const e = new Error('Resposta inválida do provedor de clima');
    e.code = 'WEATHER_BAD_RESPONSE';
    throw e;
  }
  return {
    city_name: r.city_name,
    temp: r.temp,
    condition_slug: r.condition_slug,
    description: r.description
  };
}

module.exports = { getWeatherByCity };
