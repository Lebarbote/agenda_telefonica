const { contactSchema } = require('../../src/utils/validation');

describe('contactSchema', () => {
  test('email inválido falha', () => {
    const { error } = contactSchema.validate({
      nome: 'A',
      endereco: { cidade: 'RJ' },
      email: 'x',
      telefones: ['12345678']
    });
    expect(error).toBeTruthy();
  });

  test('mínimo: nome, cidade, email, 1 telefone', () => {
    const { error } = contactSchema.validate({
      nome: 'A',
      endereco: { cidade: 'RJ' },
      email: 'a@a.com',
      telefones: ['12345678']
    });
    expect(error).toBeFalsy();
  });
});
