# RID214677_Desafio04

Projeto de API para E-commerce - DNCommerce
Este projeto foi desenvolvido como um sistema de back-end para a DNCommerce, uma loja online de produtos de beleza. O principal objetivo era criar uma API funcional para gerenciar o cadastro de produtos e o registro de vendas, com um foco especial na modelagem correta de um banco de dados relacional para garantir a integridade e a eficiência dos dados.

Para a construção da API, foi utilizado Node.js com o framework Express.js, que permite criar as rotas e controlar as requisições de forma simples e rápida. A conexão com o banco de dados PostgreSQL é gerenciada pelo driver pg. Todo o sistema foi pensado para ser escalável e de fácil manutenção.

A base do projeto é a sua estrutura de banco de dados. Ela é composta por quatro tabelas principais: clientes, produtos, vendas e venda_itens. A tabela vendas registra a informação geral de uma compra, como o cliente e a data, enquanto a venda_itens detalha quais produtos e em que quantidade foram vendidos, criando um relacionamento eficiente entre vendas e produtos. O estoque é controlado diretamente na tabela produtos, através de um campo que é atualizado a cada venda.

Diagrama do Banco de Dados

A API expõe dois endpoints principais. O primeiro é o POST /produtos, que permite o cadastro de novos itens no catálogo da loja. O segundo, e mais complexo, é o POST /vendas. Esta rota recebe o ID de um cliente e uma lista de produtos. A partir daí, ela realiza uma transação no banco de dados para registrar a venda, inserir os itens correspondentes e, crucialmente, atualizar a quantidade em estoque de cada produto vendido. Esse processo garante que os dados permaneçam consistentes.

Para executar o projeto, basta clonar o repositório, instalar as dependências com npm install, configurar as credenciais do seu banco de dados PostgreSQL no arquivo .env e iniciar o servidor com o comando npm run dev.

Este projeto foi desenvolvido por Kevin Joseph Cruz.
