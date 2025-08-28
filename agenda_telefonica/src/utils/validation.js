const Joi = require('joi');

const phoneRaw = Joi.string().min(8).max(20).pattern(/[0-9()+\-.\s]+/);

const contactSchema = Joi.object({
  nome: Joi.string().min(1).required(),
  endereco: Joi.object({
    rua: Joi.string().allow('', null),
    cidade: Joi.string().min(1).required(),
    uf: Joi.string().length(2).uppercase().allow('', null)
  }).required(),
  email: Joi.string().email().required(),
  telefones: Joi.array().items(phoneRaw).min(1).required()
});

module.exports = { contactSchema };
