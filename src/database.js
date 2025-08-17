// Importa o driver do PostgreSQL
const { Pool } = require('pg');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Configura o pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool, // Adicione esta linha para exportar o pool
};