# Ecommerce API

## Introdução
Esta é uma API para uma plataforma de e-commerce que permite aos usuários gerenciar produtos, pedidos e clientes. A API utiliza autenticação JWT para proteger rotas e PostgreSQL como banco de dados.

## Tecnologias Utilizadas
- Node.js
- Express
- PostgreSQL
- JWT (JSON Web Token)
- Swagger (Documentação da API)
- Docker

## Instalação
1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/ecommerce-api.git
    cd ecommerce-api
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
    ```env
    DB_USER=seu_usuario
    DB_HOST=localhost
    DB_NAME=seu_banco
    DB_PASS=sua_senha
    DB_PORT=5432
    JWT_SECRET=sua_chave_secreta
    PORT=3000
    ```

## Uso
Para iniciar o servidor, execute:
```bash
npm start
```
O servidor será iniciado em `http://localhost:3000`.

## Documentação da API
A documentação da API está disponível em `http://localhost:3000/api-docs` após iniciar o servidor.

## Docker
Para iniciar o projeto usando Docker, execute:
```bash
docker-compose up --build
```
Isso iniciará os serviços da API, banco de dados PostgreSQL e pgAdmin.

## Rotas da API
### Autenticação
- `POST /auth/register`: Registra um novo usuário.
- `POST /auth/login`: Faz login e retorna um token JWT.
- `POST /auth/refresh`: Gera um novo access token usando um refresh token.

### Produtos
- `GET /products`: Retorna a lista de produtos.
- `GET /products/{id}`: Obtém um produto pelo ID.
- `POST /products`: Adiciona um novo produto (apenas autenticado).
- `PUT /products/{id}`: Atualiza um produto pelo ID (apenas autenticado).
- `DELETE /products/{id}`: Remove um produto pelo ID (apenas autenticado).

## Contribuição
Contribuições são bem-vindas! Faça um fork do repositório e envie um pull request.

## Licença
Este projeto está licenciado sob a licença MIT.
