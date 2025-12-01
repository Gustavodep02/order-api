## Order API

API simples para gerenciamento de pedidos, desenvolvida para um desafio técnico.

O projeto utiliza **Node.js**, **Express**, **Prisma**, **PostgreSQL no Docker** **Autenticacao JWT** e documentação com **Swagger**.

## Funcionalidades
- Criar um novo pedido
- Buscar pedido por ID
- Listar todos os pedidos
- Atualizar pedido
- Deletar pedido
- Autenticação JWT simples
- Documentação Swagger em /docs

## requisitos para rodar o projeto
**Docker** e **Docker Compose**

**Node.js** 

**Git**

## Como usar
Execute os comandos a seguir
```bash
git clone https://github.com/Gustavodep02/order-api.git
cd order-api
npm install
docker-compose up -d
node server.js
```
Apos iniciar o servidor a API estara disponivel em http://localhost:3000

Toda a documentação da API está disponível no Swagger na rota http://localhost:3000/docs

A partir da pagina do Swagger voce pode:

- Testar todas as rotas
- Enviar requisições autenticadas
- Visualizar os modelos de entrada e saída
- Gerar tokens JWT pelo endpoint de login

## Login para receber o token jwt
deve ser feito o login na rota POST /login com o json com as seguintes credenciais de acesso no corpo
```json
{ 
"email": "adm@teste.com",
"senha": "12345" 
} 
