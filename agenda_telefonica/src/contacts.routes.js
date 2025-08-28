const express = require('express');
const ctrl = require('./contacts.controller');

const router = express.Router();

router.post('/', ctrl.createContact);
router.get('/', ctrl.listContacts);
router.get('/:id', ctrl.getContact);
router.put('/:id', ctrl.updateContact);
router.patch('/:id', ctrl.updateContact);
router.delete('/:id', ctrl.deleteContact);

module.exports = router;
