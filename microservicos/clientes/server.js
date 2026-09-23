const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

app.get('/clientes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao consultar cliente por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/clientes', async (req, res) => {
  const { nome, sobrenome, telefone, email } = req.body;

  if (!nome || !sobrenome || !email) {
    return res.status(400).json({ 
      error: 'Os campos "nome", "sobrenome" e "email" são obrigatórios.' 
    });
  }

  try {
    const insertQuery = `
      INSERT INTO clientes (nome, sobrenome, telefone, email)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [nome, sobrenome, telefone || null, email]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Microserviço de clientes rodando na porta ${PORT}`);
});