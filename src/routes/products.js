const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Gerenciamento de produtos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retorna a lista de produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 */
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao buscar produtos");
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtém um produto pelo ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Produto não encontrado" });

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao buscar produto");
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Adiciona um novo produto (apenas autenticado)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Novo Produto"
 *               description:
 *                 type: string
 *                 example: "Descrição do produto"
 *               price:
 *                 type: number
 *                 example: 99.99
 *               stock:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 */
router.post("/", authMiddleware, async (req, res) => {
    const { name, description, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: "Nome, preço e estoque são obrigatórios" });
    }

    try {
        const newProduct = await db.query(
            "INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, description, price, stock]
        );
        res.status(201).json(newProduct.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao adicionar produto");
    }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto pelo ID (apenas autenticado)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 */
router.put("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    try {
        const result = await db.query(
            "UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *",
            [name, description, price, stock, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Produto não encontrado" });

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao atualizar produto");
    }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Remove um produto pelo ID (apenas autenticado)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: "Produto não encontrado" });

        res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao excluir produto");
    }
});

module.exports = router;
