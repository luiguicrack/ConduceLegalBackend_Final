import { Router } from "express";
import CategoriaController from "../controllers/categoria.controller.js";
import { verificarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Endpoints para gestionar las categorías disponibles
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Devuelve la lista completa de categorías registradas en la base de datos.
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_categoria:
 *                     type: integer
 *                     example: 1
 *                   nombre_categoria:
 *                     type: string
 *                     example: "Normas de tránsito"
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error al obtener las categorías
 */
router.get("/", verificarToken, CategoriaController.listar);

export default router;
