require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const swaggerSetup = require("./swagger");
const productRoutes = require("./routes/products");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./logger");
const app = express();

app.use(cors());
app.use(express.json());

// Rotas de autenticação
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

/**
 * @swagger
 * /private:
 *   get:
 *     summary: Acessa uma rota protegida (somente autenticado)
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso permitido
 *       401:
 *         description: Token JWT inválido ou ausente
 */
app.get("/private", authMiddleware, (req, res, next) => {
    res.json({ message: "Bem-vindo à rota protegida!", user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`📄 Documentação disponível em http://localhost:${PORT}/api-docs`);
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
});

// Configurar Swagger
swaggerSetup(app);

app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
