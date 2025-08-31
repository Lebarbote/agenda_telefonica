const fs = require('fs');
const path = require('path');

const Contact = require('../../src/models/contact.model');

beforeEach(async () => {
  await Contact.deleteMany({});
});


// Aponta DB para um arquivo de teste antes de carregar o app
process.env.NODE_ENV = 'test';
const TEST_DB = path.join(__dirname, 'db.test.json');
process.env.DB_FILE = TEST_DB;

// Mock da API de clima (resposta determinística)
jest.mock('../../src/services/weather.service', () => ({
  getWeatherByCity: jest.fn(async () => ({
    ok: true,
    temp: 28,
    description: 'Parcialmente nublado',
    condition_slug: 'cloudly_day',
    city_name: 'Rio de Janeiro, RJ'
  }))
}));

const request = require('supertest');
const app = require('../../src/server');

function resetDb() {
  fs.writeFileSync(TEST_DB, JSON.stringify({ contacts: [] }, null, 2), 'utf-8');
}

describe('Contacts API (integração)', () => {
  beforeEach(() => resetDb());
  afterAll(() => { try { fs.unlinkSync(TEST_DB); } catch {} });

  let createdId;

  it('POST /contacts cria contato', async () => {
    const res = await request(app).post('/contacts').send({
      nome: 'Leticia',
      endereco: { rua: 'X', cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'leticia@example.com',
      telefones: ['(21) 99999-9999']
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('GET /contacts lista contatos (sem excluídos)', async () => {
    await request(app).post('/contacts').send({
      nome: 'A',
      endereco: { cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'a@a.com',
      telefones: ['11111111']
    });
    const res = await request(app).get('/contacts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('GET /contacts/:id retorna contato + clima + sugestao', async () => {
    const post = await request(app).post('/contacts').send({
      nome: 'B',
      endereco: { cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'b@b.com',
      telefones: ['22222222']
    });
    const id = post.body.id;
    const res = await request(app).get(`/contacts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clima');
    expect(res.body).toHaveProperty('sugestao');
  });

  it('PUT /contacts/:id atualiza contato', async () => {
    const post = await request(app).post('/contacts').send({
      nome: 'C',
      endereco: { cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'c@c.com',
      telefones: ['33333333']
    });
    const id = post.body.id;

    const res = await request(app).put(`/contacts/${id}`).send({
      nome: 'C Atualizado',
      endereco: { cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'c@c.com',
      telefones: ['33333333', '44444444']
    });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('C Atualizado');
  });

  it('DELETE /contacts/:id faz soft delete e some da listagem', async () => {
    const post = await request(app).post('/contacts').send({
      nome: 'D',
      endereco: { cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'd@d.com',
      telefones: ['55555555']
    });
    const id = post.body.id;

    const del = await request(app).delete(`/contacts/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get('/contacts');
    expect(list.status).toBe(200);
    expect(list.body.find(c => c.id === id)).toBeFalsy();
  });

  it('POST com telefones duplicados deve falhar (400)', async () => {
    const res = await request(app).post('/contacts').send({
      nome: 'E',
      endereco: { cidade: 'Rio de Janeiro', uf: 'RJ' },
      email: 'e@e.com',
      telefones: ['(21) 99999-9999', '21999999999'] // duplicados após normalização
    });
    expect(res.status).toBe(400);
  });
});
