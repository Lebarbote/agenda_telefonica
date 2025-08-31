const PORT = process.env.PORT || 3000;

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Agenda Telefônica - API',
    version: '1.0.0',
    description:
      'API REST para gerenciar uma agenda telefônica. Um contato possui `nome`, `endereco`, `email` e **um ou mais** `telefones` (sem números repetidos por contato). ' +
      'As rotas de leitura retornam enriquecimento com `clima` e `sugestao` quando há cidade informada.'
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: 'Local' }
  ],
  tags: [
    { name: 'Contacts', description: 'CRUD de contatos' }
  ],
  paths: {
    '/contacts': {
      post: {
        tags: ['Contacts'],
        summary: 'Criar contato',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateContatoInput' },
              examples: {
                exemplo: {
                  value: {
                    nome: 'João da Silva',
                    endereco: { rua: 'Rua A, 123', cidade: 'Rio de Janeiro', uf: 'RJ' },
                    email: 'joao@example.com',
                    telefones: ['21999990001', '2133330002']
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Contato' }
              }
            }
          },
          '400': {
            description: 'Erro de validação (inclui telefones duplicados)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroPadrao' }
              }
            }
          },
          '409': {
            description: 'Conflito (email já existente)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroPadrao' }
              }
            }
          }
        }
      },
      get: {
        tags: ['Contacts'],
        summary: 'Listar contatos (com filtros e enriquecimento de clima)',
        parameters: [
          {
            name: 'nome',
            in: 'query',
            description: 'Filtro por nome (case-insensitive, contém)',
            schema: { type: 'string' }
          },
          {
            name: 'email',
            in: 'query',
            description: 'Filtro por email (case-insensitive, contém)',
            schema: { type: 'string' }
          },
          {
            name: 'endereco',
            in: 'query',
            description: 'Filtro por rua/cidade/UF (case-insensitive, contém)',
            schema: { type: 'string' }
          },
          {
            name: 'telefone',
            in: 'query',
            description: 'Filtro por telefone (normalizado pelo backend)',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de contatos (enriquecidos)',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ContatoComClima' }
                }
              }
            }
          }
        }
      }
    },
    '/contacts/{id}': {
      get: {
        tags: ['Contacts'],
        summary: 'Obter contato por ID (com clima e sugestão)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Contato encontrado (enriquecido)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContatoComClima' }
              }
            }
          },
          '404': {
            description: 'Contato não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErroPadrao' } }
            }
          }
        }
      },
      put: {
        tags: ['Contacts'],
        summary: 'Atualizar contato por ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateContatoInput' },
              examples: {
                exemplo: {
                  value: {
                    nome: 'João da Silva',
                    endereco: { rua: 'Rua Nova, 456', cidade: 'Niterói', uf: 'RJ' },
                    email: 'joao@example.com',
                    telefones: ['21999990001', '2133330003']
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Contato atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Contato' }
              }
            }
          },
          '400': {
            description: 'Erro de validação (inclui telefones duplicados)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErroPadrao' } }
            }
          },
          '404': {
            description: 'Contato não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErroPadrao' } }
            }
          },
          '409': {
            description: 'Conflito (email já existente)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErroPadrao' } }
            }
          }
        }
      },
      delete: {
        tags: ['Contacts'],
        summary: 'Excluir contato por ID (soft delete)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '204': { description: 'Removido' },
          '404': {
            description: 'Contato não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErroPadrao' } }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Endereco: {
        type: 'object',
        properties: {
          rua: { type: 'string', example: 'Rua A, 123' },
          cidade: { type: 'string', example: 'Rio de Janeiro' },
          uf: { type: 'string', example: 'RJ' }
        },
        required: ['cidade', 'uf']
      },
      Contato: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66d0d9f9b86e4f2c1a9b1a23' },
          nome: { type: 'string', example: 'João da Silva' },
          endereco: { $ref: '#/components/schemas/Endereco' },
          email: { type: 'string', example: 'joao@example.com' },
          telefones: {
            type: 'array',
            items: { type: 'string', example: '21999990001' },
            minItems: 1,
            description: 'Sem números repetidos por contato'
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ClimaInfo: {
        type: 'object',
        properties: {
          cidade: { type: 'string', example: 'Rio de Janeiro' },
          temperatura_c: { type: 'number', example: 27 },
          condicao_slug: { type: 'string', example: 'clear_day' },
          descricao: { type: 'string', example: 'Tempo limpo' }
        }
      },
      ContatoComClima: {
        allOf: [
          { $ref: '#/components/schemas/Contato' },
          {
            type: 'object',
            properties: {
              clima: { $ref: '#/components/schemas/ClimaInfo' },
              sugestao: { type: 'string', example: 'Dia quente e seco: lembre-se de beber água!' }
            }
          }
        ]
      },
      CreateContatoInput: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          endereco: { $ref: '#/components/schemas/Endereco' },
          email: { type: 'string', format: 'email' },
          telefones: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          }
        },
        required: ['nome', 'endereco', 'email', 'telefones']
      },
      UpdateContatoInput: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          endereco: { $ref: '#/components/schemas/Endereco' },
          email: { type: 'string', format: 'email' },
          telefones: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          }
        },
        required: ['nome', 'endereco', 'email', 'telefones']
      },
      ErroPadrao: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validação falhou' },
              details: { oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string', nullable: true }] }
            }
          }
        }
      }
    }
  }
};

module.exports = { openapiSpec };
