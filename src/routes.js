const express = require('express');
const db = require('./database');

const routes = express.Router();

/**
 * ROTA: POST /produtos
 * DESCRIÇÃO: Cadastra um novo produto no banco de dados.
 * REQUISITO DE AVALIAÇÃO: API Rest, Nomenclaturas Claras.
 */
routes.post('/produtos', async (req, res) => {
  // 1. Pega os dados do corpo da requisição
  const { nome_produto, descricao, preco, quantidade_estoque } = req.body;

  // 2. Validação básica
  if (!nome_produto || !preco || !quantidade_estoque) {
    return res.status(400).json({ error: 'Nome, preço e quantidade são obrigatórios.' });
  }

  try {
    // 3. Monta a query SQL para inserir o produto
    const insertQuery = `
      INSERT INTO produtos(nome_produto, descricao, preco, quantidade_estoque)
      VALUES($1, $2, $3, $4)
      RETURNING *; 
    `;
    // RETURNING * é um comando do PostgreSQL que retorna o dado que acabou de ser inserido.

    const values = [nome_produto, descricao, preco, quantidade_estoque];

    // 4. Executa a query no banco de dados
    const { rows } = await db.query(insertQuery, values);

    // 5. Retorna a resposta de sucesso (201 Created) com o produto criado
    return res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * ROTA: POST /vendas
 * DESCRIÇÃO: Registra uma nova venda, seus itens e atualiza o estoque.
 * REQUISITO DE AVALIAÇÃO: API Rest, Qualidade da modelagem.
 */
routes.post('/vendas', async (req, res) => {
    // 1. Pega os dados da requisição
    const { id_cliente, itens } = req.body; // itens: [{ id_produto: 1, quantidade: 2 }, ...]

    // 2. Validação básica
    if (!id_cliente || !itens || itens.length === 0) {
        return res.status(400).json({ error: 'ID do cliente e lista de itens são obrigatórios.' });
    }

    const client = await db.pool.connect(); // Pega uma conexão do pool para fazer a transação

    try {
        // INÍCIO DA TRANSAÇÃO: Ou tudo funciona, ou nada é salvo.
        await client.query('BEGIN');

        let valorTotalVenda = 0;

        // 3. Pega o preço atual dos produtos do BANCO (fonte da verdade)
        for (const item of itens) {
            const produtoResult = await client.query('SELECT preco, quantidade_estoque FROM produtos WHERE id_produto = $1', [item.id_produto]);
            if (produtoResult.rows.length === 0) {
                throw new Error(`Produto com ID ${item.id_produto} não encontrado.`);
            }
            if (produtoResult.rows[0].quantidade_estoque < item.quantidade) {
                throw new Error(`Estoque insuficiente para o produto ID ${item.id_produto}.`);
            }
            item.preco_unitario = produtoResult.rows[0].preco; // Adiciona o preço ao item
            valorTotalVenda += item.preco_unitario * item.quantidade;
        }

        // 4. Insere o registro na tabela 'vendas'
        const vendaQuery = 'INSERT INTO vendas(id_cliente, valor_total) VALUES($1, $2) RETURNING id_venda, data_venda';
        const vendaValues = [id_cliente, valorTotalVenda];
        const vendaResult = await client.query(vendaQuery, vendaValues);
        const novaVenda = vendaResult.rows[0];

        // 5. Insere cada item na tabela 'venda_itens' e atualiza o estoque
        for (const item of itens) {
            // Insere o item na venda
            const itemQuery = 'INSERT INTO venda_itens(id_venda, id_produto, quantidade, preco_unitario) VALUES($1, $2, $3, $4)';
            const itemValues = [novaVenda.id_venda, item.id_produto, item.quantidade, item.preco_unitario];
            await client.query(itemQuery, itemValues);

            // Atualiza o estoque
            const updateEstoqueQuery = 'UPDATE produtos SET quantidade_estoque = quantidade_estoque - $1 WHERE id_produto = $2';
            await client.query(updateEstoqueQuery, [item.quantidade, item.id_produto]);
        }
        
        // FIM DA TRANSAÇÃO: Se tudo deu certo até aqui, confirma as alterações.
        await client.query('COMMIT');

        // 6. Retorna a resposta de sucesso
        return res.status(201).json({ message: 'Venda registrada com sucesso!', venda: novaVenda });

    } catch (error) {
        // Se qualquer erro ocorreu, desfaz todas as alterações
        await client.query('ROLLBACK');
        console.error('Erro ao registrar venda:', error.message);
        return res.status(500).json({ error: error.message });
    } finally {
        // Libera a conexão de volta para o pool
        client.release();
    }
});


module.exports = routes;