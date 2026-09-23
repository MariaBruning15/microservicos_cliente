const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

const PRODUTOS_URL = process.env.PRODUTOS_SERVICE_URL || 'http://produtos:3001';
const PEDIDOS_URL = process.env.PEDIDOS_SERVICE_URL || 'http://pedidos:3002';
const CLIENTES_URL = process.env.CLIENTES_SERVICE_URL || 'http://clientes:3003';

app.use('/clientes', proxy(CLIENTES_URL, {
  proxyReqPathResolver: (req) => {
    return '/clientes' + req.url;
  }
}));

app.use('/produtos', proxy(PRODUTOS_URL, {
  proxyReqPathResolver: (req) => {
    return '/produtos' + req.url;
  }
}));

app.use('/pedidos', proxy(PEDIDOS_URL, {
  proxyReqPathResolver: (req) => {
    return '/pedidos' + req.url;
  }
}));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Gateway rodando' });
});

app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
});