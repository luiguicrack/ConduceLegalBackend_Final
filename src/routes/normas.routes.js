import express from 'express';
import {
  createNorma,
  getNormas,
  getNormaById,
  updateNorma,
  deleteNorma
} from '../controllers/normasController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Norma:
 *       type: object
 *       properties:
 *         id_norma:
 *           type: integer
 *         numero_norma:
 *           type: integer
 *         titulo_norma:
 *           type: string
 *         id_categoria:
 *           type: integer
 *         id_Cnorma:
 *           type: integer
 *         descripcion:
 *           type: string
 *         fuente:
 *           type: string
 *         fecha_emicion:
 *           type: string
 *           format: date
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/gestion/normas:
 *   get:
 *     summary: Obtener listado de normas
 *     tags: [Gestión - Normas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página actual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de registros por página
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: estado
 *         schema:
 *           type: integer
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda en título o descripción
 *     responses:
 *       200:
 *         description: Lista de normas obtenida exitosamente
 */
router.get('/normas', getNormas);

/**
 * @swagger
 * /api/gestion/normas/{id}:
 *   get:
 *     summary: Obtener norma por ID
 *     tags: [Gestión - Normas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Norma encontrada
 *       404:
 *         description: Norma no encontrada
 */
router.get('/normas/:id', getNormaById);

/**
 * @swagger
 * /api/gestion/normas:
 *   post:
 *     summary: Crear nueva norma
 *     tags: [Gestión - Normas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_norma
 *               - titulo_norma
 *               - id_categoria
 *               - id_Cnorma
 *               - descripcion
 *             properties:
 *               numero_norma:
 *                 type: integer
 *                 example: 11
 *               titulo_norma:
 *                 type: string
 *                 example: "Nueva Normativa de Prueba"
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               id_Cnorma:
 *                 type: integer
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 example: "Descripción detallada de la nueva normativa..."
 *               fuente:
 *                 type: string
 *                 example: "Congreso de la República"
 *               fecha_emicion:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Norma creada exitosamente
 *       400:
 *         description: Datos inválidos o número de norma duplicado
 */
router.post('/normas', createNorma);

/**
 * @swagger
 * /api/gestion/normas/{id}:
 *   put:
 *     summary: Actualizar norma existente
 *     tags: [Gestión - Normas]
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
 *             $ref: '#/components/schemas/Norma'
 *     responses:
 *       200:
 *         description: Norma actualizada exitosamente
 *       404:
 *         description: Norma no encontrada
 */
router.put('/normas/:id', updateNorma);

/**
 * @swagger
 * /api/gestion/normas/{id}:
 *   delete:
 *     summary: Eliminar norma
 *     tags: [Gestión - Normas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Norma eliminada exitosamente
 *       404:
 *         description: Norma no encontrada
 */
router.delete('/normas/:id', deleteNorma);

export default router;
