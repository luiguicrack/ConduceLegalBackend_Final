import express from 'express';
import FAQController from '../controllers/faq.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/faq/preguntas:
 *   get:
 *     summary: Obtener todas las preguntas frecuentes
 *     description: Retorna todas las preguntas de la base de datos
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
 *                     type: object
 *                     properties:
 *                       id_pregunta:
 *                         type: integer
 *                       pregunta:
 *                         type: string
 *                       respuesta:
 *                         type: string
 *                       fecha_creacion:
 *                         type: string
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
 */
router.get('/pregunta/:id', FAQController.getPreguntaById);

/**
 * @swagger
 * /api/faq/recientes:
 *   get:
 *     summary: Obtener preguntas más recientes
 *     tags: [Preguntas Frecuentes]
 */
router.get('/recientes', FAQController.getPreguntasRecientes);

/**
 * @swagger
 * /api/faq/preguntas:
 *   post:
 *     summary: Crear una nueva pregunta
 *     tags: [Preguntas Frecuentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo_pregunta
 *               - respuesta
 *             properties:
 *               titulo_pregunta:
 *                 type: string
 *                 example: "¿Cómo resetear mi contraseña?"
 *               respuesta:
 *                 type: string
 *                 example: "Para resetear tu contraseña ve a 'Olvidé mi contraseña'..."
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *                 description: Opcional, si no se pasa se inserta NULL
 *     responses:
 *       201:
 *         description: Pregunta creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/preguntas', FAQController.crearPregunta);

/**
 * @swagger
 * /api/faq/preguntas/{id}:
 *   delete:
 *     summary: Eliminar una pregunta frecuente por su ID
 *     description: Permite eliminar una pregunta existente mediante su identificador único
 *     tags: [Preguntas Frecuentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la pregunta a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pregunta eliminada exitosamente
 *       404:
 *         description: Pregunta no encontrada
 */
router.delete('/preguntas/:id', FAQController.eliminarPregunta);

/**
 * @swagger
 * /api/faq/usuario/{id_usuario}/preguntas:
 *   get:
 *     summary: Obtener preguntas de un usuario específico
 *     tags: [Preguntas Frecuentes]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Preguntas del usuario
 */
router.get('/usuario/:id_usuario/preguntas', FAQController.getMisPreguntas);

export default router;
