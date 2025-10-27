import { Router } from "express";
import CategoriaNormaController from "../controllers/categoriaNorma.controller.js";
import { verificarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorías de Norma
 *   description: Endpoints para gestionar las categorías de normas
 */

/**
 * @swagger
 * /api/categoria_norma:
 *   get:
 *     summary: Obtener todas las categorías de norma
 *     description: Devuelve la lista completa de categorías de norma registradas en la base de datos.
 *     tags: [Categorías de Norma]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías de norma obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_Cnorma:
 *                     type: integer
 *                     example: 1
 *                   nombre_cnorma:
 *                     type: string
 *                     example: Ley
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error al obtener las categorías de norma
 */
router.get("/", verificarToken, CategoriaNormaController.listar);

export default router;
