function normalizePhone(p) {
  if (typeof p !== 'string') return '';
  return p.replace(/\D/g, ''); // mantém apenas dígitos
}

module.exports = { normalizePhone };
