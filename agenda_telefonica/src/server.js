require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const contactsRouter = require('./contacts.routes');

// Middleware de erro (se não existir ainda, cria um fallback simples)
let errorHandler;
try {
  ({ errorHandler } = require('./middlewares/error'));
} catch {
  errorHandler = (err, req, res, next) => {
    const status = err?.status || 500;
    res.status(status).json({
      error: {
        code: err?.code || 'INTERNAL_ERROR',
        message: err?.message || 'Erro interno',
        details: err?.details || null
      }
    });
  };
}

// Swagger opcional (não quebra se não estiver instalado/gerado)
let swaggerUi, openapiSpec;
try {
  swaggerUi = require('swagger-ui-express');
  ({ openapiSpec } = require('./swagger'));
} catch (e) {
  console.warn('Swagger não carregado (ok em dev):', e.message);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Habilita /docs somente se Swagger carregou
if (swaggerUi && openapiSpec) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
}

// Rotas da aplicação
app.use('/contacts', contactsRouter);

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// 404 padronizado
app.use((req, res) => {
  return res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Rota não encontrada' }
  });
});

// Middleware final de erros
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Em testes, exporta o app sem abrir porta
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
    if (swaggerUi && openapiSpec) {
      console.log(`Docs: http://localhost:${PORT}/docs`);
    }
  });
}

module.exports = app;