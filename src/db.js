const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

// Criar tabela de usuários (caso não exista)
pool.query(
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`,
    (err) => {
        if (err) console.error("Erro ao criar tabela users:", err);
        else console.log("Tabela users verificada com sucesso");
    }
);

pool.query(
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    )`,
    (err) => {
        if (err) console.error("Erro ao criar tabela refresh_tokens:", err);
        else console.log("Tabela refresh_tokens verificada com sucesso");
    }
);


pool.query(
    `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0
    )`,
    (err) => {
        if (err) console.error("Erro ao criar tabela products:", err);
        else console.log("Tabela products verificada com sucesso");
    }
);
