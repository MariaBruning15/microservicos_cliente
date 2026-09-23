const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'pedidos_db',
});

// Inicialização automática das tabelas
const initDb = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      cliente_id INT NOT NULL,
      valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS itens_pedido (
      id SERIAL PRIMARY KEY,
      pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
      produto_id INT NOT NULL,
      quantidade INT NOT NULL,
      preco_unitario NUMERIC(10, 2) NOT NULL
    );
  `;
  try {
    await pool.query(createTablesQuery);
    console.log('Tabelas "pedidos" e "itens_pedido" verificadas/criadas com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados de pedidos:', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};