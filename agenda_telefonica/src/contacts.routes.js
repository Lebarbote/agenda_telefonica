const express = require('express');
const ctrl = require('./contacts.controller');

const router = express.Router();

/**
 * @openapi
 * /contacts:
 *   post:
 *     summary: Cria contato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, endereco, email, telefones]
 *             properties:
 *               nome: { type: string, example: "Leticia Barbosa" }
 *               endereco:
 *                 type: object
 *                 required: [cidade]
 *                 properties:
 *                   rua: { type: string, example: "Menezes Vieira" }
 *                   cidade: { type: string, example: "Rio de Janeiro" }
 *                   uf: { type: string, example: "RJ" }
 *               email: { type: string, format: email, example: "leticia@example.com" }
 *               telefones:
 *                 type: array
 *                 items: { type: string, example: "(21) 99999-9999" }
 *     responses:
 *       201:
 *         description: Contato criado
 *       400:
 *         description: Erro de validação
 */

router.post('/', ctrl.createContact);
/**
 * @openapi
 * /contacts:
 *   get:
 *     summary: Lista contatos (com filtros)
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema: { type: string }
 *       - in: query
 *         name: endereco
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: telefone
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de contatos (sem os excluídos logicamente)
 */

router.get('/', ctrl.listContacts);
/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     summary: Exibe um contato específico + clima e sugestão
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato encontrado (com clima e sugestão, se cidade definida)
 *       404:
 *         description: Contato não encontrado
 */

router.get('/:id', ctrl.getContact);
/**
 * @openapi
 * /contacts/{id}:
 *   put:
 *     summary: Atualiza contato (substitui todos os campos)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, endereco, email, telefones]
 *             properties:
 *               nome: { type: string, example: "Leticia Barbosa" }
 *               endereco:
 *                 type: object
 *                 required: [cidade]
 *                 properties:
 *                   rua: { type: string, example: "Menezes Vieira" }
 *                   cidade: { type: string, example: "Rio de Janeiro" }
 *                   uf: { type: string, example: "RJ" }
 *               email: { type: string, format: email, example: "leticia@example.com" }
 *               telefones:
 *                 type: array
 *                 items: { type: string, example: "(21) 99999-9999" }
 *     responses:
 *       200:
 *         description: Contato atualizado
 *       400:
 *         description: Erro de validação (e.g., telefones duplicados)
 *       404:
 *         description: Contato não encontrado
 */

router.put('/:id', ctrl.updateContact);
router.patch('/:id', ctrl.updateContact);
/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     summary: Exclui contato (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Excluído logicamente (sem conteúdo)
 *       404:
 *         description: Contato não encontrado
 */

router.delete('/:id', ctrl.deleteContact);

module.exports = router;
