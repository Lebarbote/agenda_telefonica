const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Agenda Telefônica API',
      version: '1.0.0',
      description: 'CRUD de contatos com clima (HG Weather) e soft delete.'
    }
  },
  apis: ['./src/contacts.routes.js'], // vamos pegar as rotas
};

const openapiSpec = swaggerJSDoc(options);

module.exports = { openapiSpec };
