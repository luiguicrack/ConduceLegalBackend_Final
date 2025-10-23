import { Router } from 'express';
import { noticiaController } from '../controllers/noticia.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middlewares.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Noticias
 *     description: Endpoints del CRUD para gestionar noticias de seguridad vial
 */

// 🔹 Obtener noticia por ID
/**
 * @swagger
 * /api/noticias/{id}:
 *   get:
 *     summary: Obtener una noticia por ID
 *     description: Devuelve la información de una noticia específica.
 *     tags: [Noticias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la noticia
 *     responses:
 *       200:
 *         description: Noticia obtenida correctamente
 *       404:
 *         description: Noticia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', noticiaController.obtener);

/**
 * @swagger
 * /api/noticias:
 *   post:
 *     summary: Crear una nueva noticia
 *     description: Crea una nueva noticia (solo administradores autenticados).
 *     tags: [Noticias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Nueva campaña sobre seguridad vial"
 *               descripcion:
 *                 type: string
 *                 example: "Se promueve el uso del cinturón de seguridad en carreteras."
 *               fecha_publicacion:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-22"
 *               fuente:
 *                 type: string
 *                 example: "Ministerio de Transporte"
 *               id_estado:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Noticia creada correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.post('/', verificarToken, verificarAdmin, async (req, res, next) => {
    try {
        // Adaptar los nombres del cuerpo para que coincidan con los del service
        const { titulo, descripcion, fecha_publicacion, fuente, id_estado } = req.body;

        // Obtener ID del usuario desde el token decodificado
        const id_usuarios = req.usuario.id_usuarios;

        req.body = {
            titulo_noticia: titulo,
            contenido_noticia: descripcion,
            fecha_publicacion,
            fuente,
            id_estado,
            id_usuarios
        };

        next(); // Pasar al controlador
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `Error al procesar los datos de la noticia: ${error.message}`
        });
    }
}, noticiaController.crear);

/**
 * @swagger
 * /api/noticias/{id}:
 *   put:
 *     summary: Actualizar una noticia existente
 *     description: Actualiza la información de una noticia (solo administradores).
 *     tags: [Noticias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la noticia a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Actualización: Campaña nacional sobre seguridad vial"
 *               descripcion:
 *                 type: string
 *                 example: "Se amplía la campaña a nivel nacional para promover el uso del casco y cinturón de seguridad. También se incluirán talleres educativos en colegios."
 *               fecha_publicacion:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-23"
 *               fuente:
 *                 type: string
 *                 example: "Ministerio de Transporte y Policía Nacional de Tránsito"
 *               id_estado:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Noticia actualizada correctamente
 *       400:
 *         description: Error de validación o datos incorrectos
 *       404:
 *         description: Noticia no encontrada
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.put('/:id', verificarToken, verificarAdmin, async (req, res, next) => {
    try {
        const { titulo, descripcion, fecha_publicacion, fuente, id_estado } = req.body;
        const id_usuarios = req.usuario.id_usuarios;

        req.body = {
            titulo_noticia: titulo,
            contenido_noticia: descripcion,
            fecha_publicacion,
            fuente,
            id_estado,
            id_usuarios
        };

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `Error al procesar los datos para actualizar la noticia: ${error.message}`
        });
    }
}, noticiaController.actualizar);

// 🔹 Eliminar noticia
/**
 * @swagger
 * /api/noticias/{id}:
 *   delete:
 *     summary: Eliminar una noticia
 *     description: Elimina una noticia existente por su ID (solo administradores).
 *     tags: [Noticias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la noticia
 *     responses:
 *       200:
 *         description: Noticia eliminada correctamente
 *       404:
 *         description: Noticia no encontrada
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.delete('/:id', verificarToken, verificarAdmin, noticiaController.eliminar);

export default router;
