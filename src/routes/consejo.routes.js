import { Router } from 'express';
import { consejoController } from '../controllers/consejo.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middlewares.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Consejos
 *     description: Endpoints del CRUD para gestionar consejos de seguridad vial
 */

/**
 * @swagger
 * /api/consejos:
 *   get:
 *     summary: Listar todos los consejos
 *     description: Devuelve una lista de todos los consejos registrados en el sistema.
 *     tags: [Consejos]
 *     responses:
 *       200:
 *         description: Lista de consejos obtenida correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', consejoController.listar);

/**
 * @swagger
 * /api/consejos/{id}:
 *   get:
 *     summary: Obtener un consejo por ID
 *     description: Devuelve la información de un consejo específico.
 *     tags: [Consejos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del consejo
 *     responses:
 *       200:
 *         description: Consejo obtenido correctamente
 *       404:
 *         description: Consejo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', consejoController.obtener);

/**
 * @swagger
 * /api/consejos:
 *   post:
 *     summary: Crear un nuevo consejo
 *     description: Crea un nuevo consejo en la base de datos (solo administradores).
 *     tags: [Consejos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_consejo:
 *                 type: string
 *                 example: "045"
 *               titulo_consejo:
 *                 type: string
 *                 example: "Uso del cinturón de seguridad"
 *               descripcion:
 *                 type: string
 *                 example: "Usar el cinturón reduce el riesgo de lesiones graves en un 50%."
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               id_estado:
 *                 type: integer
 *                 example: 1
 *               id_norma:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Consejo creado correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.post('/', verificarToken, verificarAdmin, consejoController.crear);

/**
 * @swagger
 * /api/consejos/{id}:
 *   put:
 *     summary: Actualizar un consejo
 *     description: Actualiza la información de un consejo existente (solo administradores).
 *     tags: [Consejos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del consejo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo_consejo:
 *                 type: string
 *                 example: "Revisión técnica periódica"
 *               descripcion:
 *                 type: string
 *                 example: "Verifica el estado del vehículo antes de cada viaje."
 *               id_estado:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Consejo actualizado correctamente
 *       400:
 *         description: Error de validación o datos incorrectos
 *       404:
 *         description: Consejo no encontrado
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.put('/:id', verificarToken, verificarAdmin, consejoController.actualizar);

/**
 * @swagger
 * /api/consejos/{id}:
 *   delete:
 *     summary: Eliminar un consejo
 *     description: Elimina un consejo existente por su ID (solo administradores).
 *     tags: [Consejos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del consejo
 *     responses:
 *       200:
 *         description: Consejo eliminado correctamente
 *       404:
 *         description: Consejo no encontrado
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.delete('/:id', verificarToken, verificarAdmin, consejoController.eliminar);

export default router;
