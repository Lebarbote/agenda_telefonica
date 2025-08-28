function isSunny(slug) {
  return ['clear_day'].includes(slug); // dia limpo
}
function isRainy(slug, description = '') {
  const s = (slug || '').toLowerCase();
  const d = (description || '').toLowerCase();
  return ['rain', 'storm', 'hail'].includes(s) || d.includes('chuva') || d.includes('chuvis');
}

function buildSuggestion(temp, slug, description) {
  if (typeof temp !== 'number') return 'Não foi possível sugerir uma atividade agora.';

  if (temp <= 18) {
    return 'Ofereça um chocolate quente ao seu contato...';
  }
  if (temp >= 30) {
    if (isSunny(slug)) return 'Convide seu contato para ir à praia com esse calor!';
    if (isRainy(slug, description)) return 'Convide seu contato para tomar um sorvete';
    // fallback quando >=30 e condição neutra
    return 'Convide seu contato para uma atividade refrescante ao ar livre';
  }
  // entre 18 e 30
  if (isSunny(slug)) return 'Convide seu contato para fazer alguma atividade ao ar livre';
  if (isRainy(slug, description)) return 'Convide seu contato para ver um filme';
  
  // fallback
  return 'Convide seu contato para um passeio leve';
}

module.exports = { buildSuggestion };
