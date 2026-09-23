const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL || 'http://clientes:3003';

app.get('/pedidos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pedidos ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pedidoResult = await db.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const itensResult = await db.query('SELECT * FROM itens_pedido WHERE pedido_id = $1', [id]);
    
    const pedido = pedidoResult.rows[0];
    pedido.itens = itensResult.rows;

    res.status(200).json(pedido);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/pedidos', async (req, res) => {
  const { cliente_id, itens } = req.body;

  if (!cliente_id || !itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      error: 'É necessário informar o "cliente_id" e ao menos um item em "itens".'
    });
  }

  try {
    const clienteResponse = await fetch(`${CLIENTES_SERVICE_URL}/clientes/${cliente_id}`);
    
    if (clienteResponse.status === 404) {
      return res.status(400).json({ error: 'Cliente não encontrado.' });
    }

    if (!clienteResponse.ok) {
      return res.status(500).json({ error: 'Falha na comunicação com o serviço' });
    }

    let valorTotal = 0;
    for (const item of itens) {
      if (!item.produto_id || !item.quantidade || !item.preco_unitario) {
        return res.status(400).json({ error: 'Todos os itens devem ter produto_id, quantidade e preco_unitario.' });
      }
      valorTotal += item.quantidade * item.preco_unitario;
    }

    const insertPedidoQuery = `
      INSERT INTO pedidos (cliente_id, valor_total, status)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const pedidoResult = await db.query(insertPedidoQuery, [cliente_id, valorTotal, 'PENDENTE']);
    const novoPedido = pedidoResult.rows[0];

    const insertItemQuery = `
      INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    novoPedido.itens = [];
    for (const item of itens) {
      const itemResult = await db.query(insertItemQuery, [
        novoPedido.id,
        item.produto_id,
        item.quantidade,
        item.preco_unitario
      ]);
      novoPedido.itens.push(itemResult.rows[0]);
    }

    res.status(201).json(novoPedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno ao processar o pedido.' });
  }
});

app.listen(PORT, () => {
  console.log(`Microserviço de pedidos rodando na porta ${PORT}`);
});