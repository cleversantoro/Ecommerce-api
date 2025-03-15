const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../db");

const router = express.Router();
const crypto = require("crypto"); // Para gerar tokens seguros

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas de autenticação
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João"
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro na validação dos dados
 */
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("O nome é obrigatório"),
        body("email").isEmail().withMessage("O email deve ser válido"),
        body("password").isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: "Usuário já cadastrado" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await db.query(
                "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
                [name, email, hashedPassword]
            );

            res.status(201).json(newUser.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }
);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna o token JWT
 *       400:
 *         description: Credenciais inválidas
 */
router.post("/login", async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    // res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );

    const { email, password } = req.body;

    try {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        const accessToken = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = crypto.randomBytes(40).toString("hex");
        await db.query("INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)", [
            refreshToken,
            user.rows[0].id,
        ]);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro no servidor");
    }
});


/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gera um novo access token usando um refresh token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "abc123"
 *     responses:
 *       200:
 *         description: Novo access token gerado com sucesso
 *       401:
 *         description: Refresh token inválido ou expirado
 */
router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const result = await db.query("SELECT user_id FROM refresh_tokens WHERE token = $1", [
            refreshToken,
        ]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Refresh token inválido" });
        }

        const userId = result.rows[0].user_id;

        const newAccessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro no servidor");
    }
});


module.exports = router;


