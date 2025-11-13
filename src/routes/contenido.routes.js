import { Router } from 'express';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middlewares.js';
import authService from '../services/auth.service.js';


const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Contenido
 *     description: Endpoints para consejos, leyes, noticias y preguntas frecuentes
 */

/**
 * @swagger
 * /api/consejos:
 *   get:
 *     summary: HU0026 - Obtener consejos viales
 *     description: Devuelve una lista de consejos almacenados en la base de datos.
 *     tags: [Contenido]
 *     responses:
 *       200:
 *         description: Lista de consejos obtenida correctamente
 */
router.get('/consejos', async (req, res) => {
    try {
        const consejos = await authService.listarConsejos(); // 🔹 Llama al servicio real
        res.json({
            success: true,
            message: 'Consejos obtenidos correctamente',
            data: consejos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener los consejos'
        });
    }
});

/**
 * @swagger
 * /api/leyes:
 *   get:
 *     summary: HU0026 - Consultar leyes de tránsito
 *     description: Devuelve un listado de leyes de tránsito almacenadas en la base de datos.
 *     tags: [Contenido]
 *     responses:
 *       200:
 *         description: Lista de leyes obtenida correctamente
 */
router.get("/leyes", async (req, res) => {
    try {
        const leyes = await authService.listarNormatividad(); // 🔹 trae desde la BD
        res.json({
            success: true,
            message: "Leyes obtenidas correctamente",
            data: leyes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error al obtener las leyes",
        });
    }
});

/**
 * @swagger
 * /api/noticias:
 *   get:
 *     summary: HU0026 - Obtener noticias de tránsito
 *     description: Devuelve un listado de noticias recientes sobre tránsito y movilidad desde la base de datos.
 *     tags: [Contenido]
 *     responses:
 *       200:
 *         description: Noticias obtenidas correctamente
 */
router.get("/noticias", async (req, res) => {
    try {
        const noticias = await authService.listarNoticias(); // 🔹 consulta en la BD
        res.json({
            success: true,
            message: "Noticias obtenidas correctamente",
            data: noticias,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error al obtener las noticias",
        });
    }
});

/**
 * @swagger
 * /api/preguntas:
 *   get:
 *     summary: HU0026 - Preguntas frecuentes
 *     description: Devuelve un listado de preguntas frecuentes almacenadas en la base de datos.
 *     tags: [Contenido]
 *     responses:
 *       200:
 *         description: Preguntas frecuentes obtenidas correctamente
 */
router.get("/preguntas", async (req, res) => {
    try {
        const preguntas = await authService.listarPreguntas(); // 🔹 trae las preguntas desde la BD
        res.json({
            success: true,
            message: "Preguntas frecuentes obtenidas correctamente",
            data: preguntas,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error al obtener las preguntas frecuentes",
        });
    }
});

/**
 * @swagger
 * /api/busqueda:
 *   get:
 *     summary: HU003 - Búsqueda general
 *     description: Busca en leyes (normatividad), noticias, consejos y preguntas frecuentes desde la base de datos.
 *     tags: [Contenido]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda obtenidos correctamente
 */
router.get('/busqueda', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar un término de búsqueda (?q=)."
            });
        }

        const resultados = await authService.buscarPorPalabraClave(q); // 🔹 Ahora consulta desde la BD

        res.json({
            success: true,
            query: q,
            resultados
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error al realizar la búsqueda general"
        });
    }
});


/**
 * @swagger
 * /api/normas/{tipo}:
 *   get:
 *     summary: HU002 - Obtener normas según tipo de vehículo
 *     description: Devuelve normas aplicables a carros o motos según el selector, consultando desde la base de datos.
 *     tags: [Contenido]
 *     parameters:
 *       - in: path
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [carro, moto]
 *         required: true
 *         description: Tipo de vehículo (carro o moto)
 *     responses:
 *       200:
 *         description: Normas obtenidas correctamente
 */
router.get('/normas/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;

        const normas = await authService.filtrarPorVehiculo(tipo); // 🔹 Consulta real en la BD

        if (!normas || normas.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontraron normas para el tipo de vehículo: ${tipo}`
            });
        }

        res.json({
            success: true,
            tipo,
            data: normas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error al obtener normas por tipo de vehículo"
        });
    }
});

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Endpoints para la gestión de usuarios (CRUD)
 */

/**
 * @swagger
 * /api/auth/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Devuelve una lista de todos los usuarios registrados. Solo accesible para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *       401:
 *         description: Token no válido o expirado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.get('/usuarios', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await authService.listarUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
});

/**
 * @swagger
 * /api/auth/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Devuelve la información de un usuario específico por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuario = await authService.obtenerUsuario(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error });
    }
});

/**
 * @swagger
 * /api/auth/usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     description: Modifica los datos de un usuario específico. Solo accesible para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "nuevo_nombre"
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@email.com"
 *               id_rol:
 *                 type: integer
 *                 example: 2
 *               estado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos o correo ya registrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarioActualizado = await authService.actualizarUsuario(req.params.id, req.body);
        res.json({ message: 'Usuario actualizado', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
});


/**
 * @swagger
 * /api/auth/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Elimina un usuario del sistema según su ID. Solo accesible para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        await authService.eliminarUsuario(req.params.id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
});

export default router;