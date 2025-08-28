const { readDB, writeDB } = require('./db');
const { v4: uuidv4 } = require('uuid');
const { contactSchema } = require('./utils/validation');
const { normalizePhone } = require('./utils/normalizePhone');
const { buildSuggestion } = require('./utils/suggestion');
const { getWeatherByCity } = require('./services/weather.service');

// Remove duplicados com normalização por contato
function ensureUniquePhones(telefones) {
  const seen = new Set();
  const normalized = telefones.map(t => normalizePhone(t));
  for (const n of normalized) {
    if (seen.has(n)) return { ok: false };
    seen.add(n);
  }
  return { ok: true, normalized };
}

function basicContactView(c) {
  // View padrão sem campos internos
  return {
    id: c.id,
    nome: c.nome,
    endereco: c.endereco,
    email: c.email,
    telefones: c.telefones,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  };
}

async function createContact(req, res) {
  const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: 'Validação falhou', details: error.details.map(d => d.message) });
  }

  const { ok, normalized } = ensureUniquePhones(value.telefones);
  if (!ok) {
    return res.status(400).json({ error: 'Telefones duplicados não são permitidos para o mesmo contato.' });
  }

  const db = await readDB();
  const now = new Date().toISOString();
  const contact = {
    id: uuidv4(),
    nome: value.nome.trim(),
    endereco: {
      rua: value.endereco.rua || '',
      cidade: value.endereco.cidade.trim(),
      uf: (value.endereco.uf || '').toUpperCase()
    },
    email: value.email.toLowerCase(),
    telefones: normalized, // vai salvar já normalizado ~ somente dígitos ~
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };

  db.contacts.push(contact);
  await writeDB(db);
  return res.status(201).json(basicContactView(contact));
}

async function listContacts(req, res) {
  const { nome, endereco, email, telefone } = req.query;
  const db = await readDB();

  let list = db.contacts.filter(c => !c.deletedAt);

  if (nome) {
    const q = String(nome).toLowerCase();
    list = list.filter(c => c.nome.toLowerCase().includes(q));
  }
  if (email) {
    const q = String(email).toLowerCase();
    list = list.filter(c => c.email.includes(q));
  }
  if (endereco) {
    const q = String(endereco).toLowerCase();
    list = list.filter(c => {
      const blob = `${c.endereco.rua} ${c.endereco.cidade} ${c.endereco.uf}`.toLowerCase();
      return blob.includes(q);
    });
  }
  if (telefone) {
    const q = normalizePhone(String(telefone));
    list = list.filter(c => c.telefones.some(t => t.includes(q)));
  }

  return res.json(list.map(basicContactView));
}

async function getContact(req, res) {
  const { id } = req.params;
  const db = await readDB();
  const contact = db.contacts.find(c => c.id === id && !c.deletedAt);
  if (!contact) return res.status(404).json({ error: 'Contato não encontrado' });

  // Clima + sugestão
  const cidade = contact.endereco.cidade;
  let clima = null;
  let sugestao = null;

  const hasCity = cidade && cidade.trim().length > 0;
  if (hasCity) {
    const resp = await getWeatherByCity({ cidade, uf: contact.endereco.uf });
    if (resp.ok) {
      clima = {
        cidade: resp.city_name || cidade,
        temperatura_c: resp.temp,
        condicao_slug: resp.condition_slug,
        descricao: resp.description
      };
      sugestao = buildSuggestion(resp.temp, resp.condition_slug, resp.description);
    } else {
      // falha de API externa
      sugestao = 'Não foi possível obter o clima agora.';
    }
  } else {
    sugestao = 'Endereço sem cidade definida para consultar o clima.';
  }

  return res.json({
    ...basicContactView(contact),
    clima,
    sugestao
  });
}

async function updateContact(req, res) {
  const { id } = req.params;
  const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: 'Validação falhou', details: error.details.map(d => d.message) });
  }

  const db = await readDB();
  const idx = db.contacts.findIndex(c => c.id === id && !c.deletedAt);
  if (idx === -1) return res.status(404).json({ error: 'Contato não encontrado' });

  const { ok, normalized } = ensureUniquePhones(value.telefones);
  if (!ok) {
    return res.status(400).json({ error: 'Telefones duplicados não são permitidos para o mesmo contato.' });
  }

  const now = new Date().toISOString();
  db.contacts[idx] = {
    ...db.contacts[idx],
    nome: value.nome.trim(),
    endereco: {
      rua: value.endereco.rua || '',
      cidade: value.endereco.cidade.trim(),
      uf: (value.endereco.uf || '').toUpperCase()
    },
    email: value.email.toLowerCase(),
    telefones: normalized,
    updatedAt: now
  };

  await writeDB(db);
  return res.json(basicContactView(db.contacts[idx]));
}

async function deleteContact(req, res) {
  const { id } = req.params;
  const db = await readDB();
  const contact = db.contacts.find(c => c.id === id && !c.deletedAt);
  if (!contact) return res.status(404).json({ error: 'Contato não encontrado' });

  contact.deletedAt = new Date().toISOString();
  await writeDB(db);
  return res.status(204).send();
}

module.exports = {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact
};
