function errorHandler(err, req, res, next) {
  // Log mínimo 
  // console.error(err);

  // Se o erro já veio com status, uso senão: 500
  const status = err.status || 500;

  // Resposta padronizada
  return res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Erro interno',
      details: err.details || null
    }
  });
}

module.exports = { errorHandler };
