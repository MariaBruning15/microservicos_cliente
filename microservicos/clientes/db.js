const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'clientes_db',
});

// Inicialização automática da tabela no banco
const initDb = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      sobrenome VARCHAR(100) NOT NULL,
      telefone VARCHAR(20),
      email VARCHAR(150) NOT NULL UNIQUE
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Tabela "clientes" criada com sucesso.');
  } catch (err) {
    console.error('Erro ao criar o banco de dados', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};