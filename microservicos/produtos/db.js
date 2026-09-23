const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'produtos_db',
});

const initDb = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      descricao TEXT,
      preco NUMERIC(10, 2) NOT NULL,
      estoque INT NOT NULL DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Tabela "produtos" criada com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados de produtos:', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};