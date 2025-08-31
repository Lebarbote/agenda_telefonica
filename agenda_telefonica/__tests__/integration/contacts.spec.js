const request = require('supertest');
const app = require('../../src/server');
const Contact = require('../../src/models/contact.model');

describe('Contacts', () => {
  beforeEach(async () => {
    await Contact.deleteMany({});
  });

  it('POST /contacts cria contato', async () => {
    const res = await request(app)
      .post('/contacts')
      .send({
        nome: 'João',
        endereco: { rua: 'Rua A', cidade: 'Rio de Janeiro', uf: 'RJ' },
        email: 'joao@example.com',
        telefones: ['21999990001', '2133330002']
      });

    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('João');
  });

  it('bloqueia telefones duplicados no mesmo contato', async () => {
    const res = await request(app)
      .post('/contacts')
      .send({
        nome: 'Maria',
        endereco: { rua: 'Rua B', cidade: 'Niterói', uf: 'RJ' },
        email: 'maria@example.com',
        telefones: ['21999990001', '21999990001'] 
      });

    expect(res.status).toBe(400);
    expect(res.body.error?.code || res.body.code).toBeDefined();
  });
});
