const { buildSuggestion } = require('../../src/utils/suggestion');

describe('buildSuggestion', () => {
  test('≤ 18 → chocolate quente', () => {
    expect(buildSuggestion(10, 'rain')).toMatch(/chocolate quente/i);
  });

  test('≥ 30 e ensolarado → praia', () => {
    expect(buildSuggestion(32, 'clear_day')).toMatch(/praia/i);
  });

  test('≥ 30 e chuvoso → sorvete', () => {
    expect(buildSuggestion(31, 'rain')).toMatch(/sorvete/i);
  });

  test('18–30 e ensolarado → atividade ao ar livre', () => {
    expect(buildSuggestion(25, 'clear_day')).toMatch(/ao ar livre/i);
  });

  test('18–30 e chuvoso → ver um filme', () => {
    expect(buildSuggestion(22, 'rain')).toMatch(/filme/i);
  });
});
