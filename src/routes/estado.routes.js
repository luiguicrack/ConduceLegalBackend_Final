import { Router } from "express";
import EstadoController from "../controllers/estado.controller.js";
import { verificarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Estados
 *   description: Endpoints para gestionar los estados del sistema
 */

/**
 * @swagger
 * /api/estados:
 *   get:
 *     summary: Obtener todos los estados
 *     description: Devuelve la lista completa de estados disponibles en la base de datos.
 *     tags: [Estados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_estado:
 *                     type: integer
 *                     example: 1
 *                   nombre_estado:
 *                     type: string
 *                     example: Activo
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error al obtener los estados
 */
router.get("/", verificarToken, EstadoController.listar);

export default router;
