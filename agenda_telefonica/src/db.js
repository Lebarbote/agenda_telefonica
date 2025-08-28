//persistência simples em arquivo JSON — com soft delete

const fs = require('fs/promises');
const path = require('path');

const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(__dirname, '..', 'db.json');

async function readDB() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    if (!raw.trim()) return { contacts: [] };  // arquivo vazio
    const data = JSON.parse(raw);
    if (!data.contacts) data.contacts = [];
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') return { contacts: [] }; // não existe: começa vazio
    throw err;
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB, DB_FILE };

