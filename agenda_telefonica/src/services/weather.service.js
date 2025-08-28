const axios = require('axios');

async function getWeatherByCity({ cidade, uf }) {
  const baseURL = 'https://api.hgbrasil.com/weather';
  const params = {
    format: 'json',
    locale: 'pt'
  };
  if (process.env.HG_WEATHER_KEY) params.key = process.env.HG_WEATHER_KEY;

  params.city_name = uf ? `${cidade},${uf}` : cidade;

  try {
    const { data } = await axios.get(baseURL, { params, timeout: 5000 });
    const r = data && data.results;
    if (!r) throw new Error('Sem results');
    return {
      ok: true,
      temp: r.temp,
      description: r.description,
      condition_slug: r.condition_slug,
      city_name: r.city_name
    };
  } catch (err) {
    return { ok: false, error: 'Falha ao consultar a API de clima' };
  }
}

// Endpoints e campos (results.temp, results.condition_slug, results.description, city_name) conforme documentação HG Weather 
//(endpoint base GET https://api.hgbrasil.com/weather).

module.exports = { getWeatherByCity };
