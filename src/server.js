// Carrega as variáveis de ambiente antes de qualquer outra coisa
require('dotenv').config();

const express = require('express');
const routes = require('./routes');

// Cria a aplicação Express
const app = express();

// Define a porta do servidor, pegando do .env ou usando 3000 como padrão
const port = process.env.PORT || 3000;

// Middleware para o Express entender requisições com corpo em JSON
app.use(express.json());

// Middleware para usar as rotas definidas no arquivo routes.js
app.use(routes);

// Inicia o servidor e fica "escutando" na porta definida
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});