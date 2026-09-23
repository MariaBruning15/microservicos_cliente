const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/produtos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM produtos ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /produtos/:id - Consultar produto por ID
app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/produtos', async (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({
      error: 'Os campos "nome" e "preco" são obrigatórios.'
    });
  }

  try {
    const insertQuery = `
      INSERT INTO produtos (nome, descricao, preco, estoque)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [
      nome,
      descricao || null,
      preco,
      estoque || 0
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Microserviço de Produtos rodando na porta ${PORT}`);
});