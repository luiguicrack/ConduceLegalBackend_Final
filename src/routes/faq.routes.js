import express from 'express';
import FAQController from '../controllers/faq.controller.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaFAQ:
 *       type: object
 *       properties:
 *         id_categoria:
 *           type: integer
 *           example: 1
 *         nombre_categoria:
 *           type: string
 *           example: "Uso del Sistema"
 *         descripcion:
 *           type: string
 *           example: "Preguntas sobre cómo utilizar la plataforma"
 *         icono:
 *           type: string
 *           example: "💻"
 *         orden:
 *           type: integer
 *           example: 1
 *         preguntas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PreguntaFAQ'
 *     PreguntaFAQ:
 *       type: object
 *       properties:
 *         id_pregunta:
 *           type: integer
 *           example: 1
 *         pregunta:
 *           type: string
 *           example: "¿Cómo puedo registrarme en el sistema?"
 *         respuesta:
 *           type: string
 *           example: "Para registrarte, haz clic en el botón Registrarse..."
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *     BusquedaResult:
 *       type: object
 *       properties:
 *         id_pregunta:
 *           type: integer
 *         pregunta:
 *           type: string
 *         respuesta:
 *           type: string
 *         id_categoria:
 *           type: integer
 */

/**
 * @swagger
 * /api/faq/categorias:
 *   get:
 *     summary: Obtener todas las categorías de FAQ con sus preguntas
 *     description: Retorna un listado organizado de categorías con sus respectivas preguntas y respuestas
 *     tags: [Preguntas Frecuentes]
 *     responses:
 *       200:
 *         description: Lista de categorías con preguntas organizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoriaFAQ'
 *                 message:
 *                   type: string
 *                 metadata:
 *                   type: object
 *       500:
 *         description: Error interno del servidor
 */
router.get('/categorias', FAQController.getCategoriasConPreguntas);

/**
 * @swagger
 * /api/faq/preguntas:
 *   get:
 *     summary: Obtener todas las preguntas frecuentes
 *     description: Retorna todas las preguntas en formato plano para búsquedas
 *     tags: [Preguntas Frecuentes]
 *     responses:
 *       200:
 *         description: Lista de todas las preguntas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PreguntaFAQ'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/preguntas', FAQController.getAllPreguntas);

/**
 * @swagger
 * /api/faq/buscar:
 *   get:
 *     summary: Buscar preguntas frecuentes
 *     description: Busca preguntas por término en título y respuesta
 *     tags: [Preguntas Frecuentes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *         schema:
 *           type: string
 *           example: "registro"
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BusquedaResult'
 *       400:
 *         description: Término de búsqueda inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/buscar', FAQController.buscarPreguntas);

/**
 * @swagger
 * /api/faq/pregunta/{id}:
 *   get:
 *     summary: Obtener pregunta específica por ID
 *     tags: [Preguntas Frecuentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la pregunta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pregunta encontrada
 *       404:
 *         description: Pregunta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/pregunta/:id', FAQController.getPreguntaById);

export default router;