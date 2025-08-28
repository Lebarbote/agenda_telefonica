require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const contactsRouter = require('./contacts.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/contacts', contactsRouter);

// msg 404 padrão
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
