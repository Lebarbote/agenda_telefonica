const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  endereco: {
    rua:    { type: String, trim: true, default: '' },
    cidade: { type: String, trim: true, required: true },
    uf:     { type: String, trim: true, uppercase: true, required: true }
  },
  email: { type: String, trim: true, lowercase: true, index: { unique: true, sparse: true } },

  telefones: {
    type: [String],
    validate: {
      validator(arr) {
        if (!Array.isArray(arr) || arr.length < 1) return false;
        const norm = arr.map(s => String(s || '').trim());
        const set = new Set(norm);
        return norm.every(s => s.length > 0) && set.size === norm.length;
      },
      message: 'Phone numbers must be unique per contact and not empty.'
    }
  },

  deletedAt: { type: Date, default: null }
}, { timestamps: true });

ContactSchema.index({ nome: 1 });
ContactSchema.index({ 'endereco.cidade': 1 });
ContactSchema.index({ telefones: 1 });

ContactSchema.pre('validate', function(next) {
  if (Array.isArray(this.telefones)) {
    this.telefones = this.telefones
      .map(s => String(s || '').trim())
      .filter(s => s.length > 0);
  }
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
