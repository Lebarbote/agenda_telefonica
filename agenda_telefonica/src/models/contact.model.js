const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  nome:   { type: String, required: true, trim: true },

  endereco: {
    rua:    { type: String, trim: true, default: '' },
    cidade: { type: String, trim: true, default: '' },
    uf:     { type: String, trim: true, uppercase: true, default: '' }
  },

  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },

  // telefones é array de strings (normalizadas no controller)
  telefones: {
    type: [String],
    validate: {
      validator: function (arr) {
        if (!Array.isArray(arr) || arr.length < 1) return false;
        const norm = arr.map(v => String(v).trim());
        return new Set(norm).size === norm.length; // impede números repetidos no mesmo contato
      },
      message: 'Telefones duplicados não são permitidos para o mesmo contato.'
    }
  },

  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// índices úteis
ContactSchema.index({ nome: 1 });
ContactSchema.index({ 'endereco.cidade': 1 });
ContactSchema.index({ telefones: 1 });

// normalização simples
ContactSchema.pre('validate', function(next) {
  if (Array.isArray(this.telefones)) {
    this.telefones = this.telefones
      .map(v => String(v).trim())
      .filter(Boolean);
  }
  next();
});

const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;
