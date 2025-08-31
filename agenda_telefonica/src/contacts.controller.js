const Contact = require('./models/contact.model');
const { contactSchema } = require('./utils/validation');
const { normalizePhone } = require('./utils/normalizePhone');
const { buildSuggestion } = require('./utils/suggestion');
const { getWeatherCached } = require('./services/weather.cache');

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

function basicContactView(doc) {
  return {
    id: String(doc._id),
    nome: doc.nome,
    endereco: doc.endereco,
    email: doc.email,
    telefones: doc.telefones,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function createContact(req, res, next) {
  try {
    const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validação falhou',
        details: error.details.map(d => d.message)
      });
    }

    const { ok, normalized } = ensureUniquePhones(value.telefones);
    if (!ok) {
      return next({
        status: 400,
        code: 'PHONE_DUPLICATE',
        message: 'Telefones duplicados não são permitidos para o mesmo contato.'
      });
    }

    const doc = await Contact.create({
      nome: value.nome.trim(),
      endereco: {
        rua: value.endereco.rua || '',
        cidade: value.endereco.cidade.trim(),
        uf: (value.endereco.uf || '').toUpperCase()
      },
      email: value.email.toLowerCase(),
      telefones: normalized
    });

    return res.status(201).json(basicContactView(doc));
  } catch (err) {
    // 11000 = unique index (email)
    if (err && err.code === 11000) {
      return next({
        status: 409,
        code: 'UNIQUE_VIOLATION',
        message: 'Email já existente.'
      });
    }
    // validação do schema (ex: telefones duplicados)
    if (err && err.errors && err.errors['telefones']) {
      return next({
        status: 400,
        code: 'PHONE_DUPLICATE',
        message: err.errors['telefones'].message
      });
    }
    return next(err);
  }
}

async function listContacts(req, res, next) {
  try {
    const { nome, endereco, email, telefone } = req.query;

    const and = [{ deletedAt: null }];

    if (nome) {
      and.push({ nome: { $regex: String(nome), $options: 'i' } });
    }
    if (email) {
      and.push({ email: { $regex: String(email), $options: 'i' } });
    }
    if (endereco) {
      const q = String(endereco);
      and.push({
        $or: [
          { 'endereco.rua': { $regex: q, $options: 'i' } },
          { 'endereco.cidade': { $regex: q, $options: 'i' } },
          { 'endereco.uf': { $regex: q, $options: 'i' } }
        ]
      });
    }
    if (telefone) {
      const q = normalizePhone(String(telefone));
      and.push({ telefones: { $elemMatch: { $regex: q } } });
    }

    const filter = and.length ? { $and: and } : { deletedAt: null };

    const docs = await Contact.find(filter).sort({ _id: 1 }).lean();

    // Enriquecer clima + sugestão
    const enriched = await Promise.all(docs.map(async (c) => {
      const base = basicContactView(c);

      let clima = null;
      let sugestao = null;

      const cidade = c.endereco?.cidade;
      if (cidade && cidade.trim()) {
        const resp = await getWeatherCached({ cidade, uf: c.endereco.uf });
        if (resp.ok) {
          clima = {
            cidade: resp.city_name || cidade,
            temperatura_c: resp.temp,
            condicao_slug: resp.condition_slug,
            descricao: resp.description
          };
          sugestao = buildSuggestion(resp.temp, resp.condition_slug, resp.description);
        } else {
          sugestao = 'Não foi possível obter o clima agora.';
        }
      } else {
        sugestao = 'Endereço sem cidade definida para consultar o clima.';
      }

      return { ...base, clima, sugestao };
    }));

    return res.json(enriched);
  } catch (err) {
    return next(err);
  }
}

async function getContact(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Contact.findOne({ _id: id, deletedAt: null }).lean();
    if (!doc) {
      return next({
        status: 404,
        code: 'NOT_FOUND',
        message: 'Contato não encontrado'
      });
    }

    // Clima + sugestão
    const cidade = doc.endereco?.cidade;
    let clima = null;
    let sugestao = null;

    if (cidade && cidade.trim()) {
      const resp = await getWeatherCached({ cidade, uf: doc.endereco.uf });
      if (resp.ok) {
        clima = {
          cidade: resp.city_name || cidade,
          temperatura_c: resp.temp,
          condicao_slug: resp.condition_slug,
          descricao: resp.description
        };
        sugestao = buildSuggestion(resp.temp, resp.condition_slug, resp.description);
      } else {
        sugestao = 'Não foi possível obter o clima agora.';
      }
    } else {
      sugestao = 'Endereço sem cidade definida para consultar o clima.';
    }

    return res.json({ ...basicContactView(doc), clima, sugestao });
  } catch (err) {
    return next(err);
  }
}

async function updateContact(req, res, next) {
  try {
    const { id } = req.params;

    const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validação falhou',
        details: error.details.map(d => d.message)
      });
    }

    const { ok, normalized } = ensureUniquePhones(value.telefones);
    if (!ok) {
      return next({
        status: 400,
        code: 'PHONE_DUPLICATE',
        message: 'Telefones duplicados não são permitidos para o mesmo contato.'
      });
    }

    const doc = await Contact.findOne({ _id: id, deletedAt: null });
    if (!doc) {
      return next({
        status: 404,
        code: 'NOT_FOUND',
        message: 'Contato não encontrado'
      });
    }

    doc.nome = value.nome.trim();
    doc.endereco = {
      rua: value.endereco.rua || '',
      cidade: value.endereco.cidade.trim(),
      uf: (value.endereco.uf || '').toUpperCase()
    };
    doc.email = value.email.toLowerCase();
    doc.telefones = normalized;

    await doc.validate(); // checa duplicados
    await doc.save();

    return res.json(basicContactView(doc));
  } catch (err) {
    if (err && err.code === 11000) {
      return next({
        status: 409,
        code: 'UNIQUE_VIOLATION',
        message: 'Email já existente.'
      });
    }
    if (err && err.errors && err.errors['telefones']) {
      return next({
        status: 400,
        code: 'PHONE_DUPLICATE',
        message: err.errors['telefones'].message
      });
    }
    return next(err);
  }
}

async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Contact.findOne({ _id: id, deletedAt: null });
    if (!doc) {
      return next({
        status: 404,
        code: 'NOT_FOUND',
        message: 'Contato não encontrado'
      });
    }
    doc.deletedAt = new Date();
    await doc.save();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createContact,
  listContacts,
  getContact,
  updateContact,
  deleteContact
};
