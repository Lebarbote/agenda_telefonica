const { normalizePhone } = require('../../src/utils/normalizePhone');

describe('normalizePhone', () => {
  test('remove tudo que não é dígito', () => {
    expect(normalizePhone('(21) 99999-8888')).toBe('21999998888');
    expect(normalizePhone('+55 (11) 4002-8922')).toBe('551140028922');
  });
});
