import authService from '../services/auth.service.js';

export const authController = {
    // =============================
    // 🔹 AUTHENTICACIÓN Y USUARIOS
    // =============================
    async registro(req, res) {
        try {
            const resultado = await authService.registrarUsuario(req.body);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async login(req, res) {
        try {
            const resultado = await authService.loginUsuario(req.body);
            res.json({ success: true, message: 'Login exitoso', data: resultado });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    },

    async logout(req, res) {
        try {
            res.json({
                success: true,
                message: 'Sesión cerrada correctamente. El token debe eliminarse en el cliente.'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async perfil(req, res) {
        try {
            const resultado = await authService.obtenerPerfil(req.user.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    },

    // =============================
    // 🔹 CONSULTA DE LEYES
    // =============================
    async listarNormatividad(req, res) {
        try {
            const resultado = await authService.listarNormatividad();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async buscarNorma(req, res) {
        try {
            const { numero_norma, titulo_norma } = req.query;
            const resultado = await authService.buscarNorma(numero_norma, titulo_norma);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // =============================
    // 🔹 BUSCADOR GENERAL
    // =============================
    async buscarPorPalabraClave(req, res) {
        try {
            const { palabra } = req.query;
            const resultado = await authService.buscarPorPalabraClave(palabra);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // =============================
    // 🔹 FILTRO POR VEHÍCULO
    // =============================
    async filtrarPorVehiculo(req, res) {
        try {
            const { tipo } = req.params; // moto o carro
            const resultado = await authService.filtrarPorVehiculo(tipo);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // =============================
    // 🔹 NOTICIAS
    // =============================
    async listarNoticias(req, res) {
        try {
            const resultado = await authService.listarNoticias();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async crearNoticia(req, res) {
        try {
            const resultado = await authService.crearNoticia(req.body, req.user.id);
            res.status(201).json({
                success: true,
                message: 'Noticia creada correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // =============================
    // 🔹 CONSEJOS
    // =============================
    async listarConsejos(req, res) {
        try {
            const resultado = await authService.listarConsejos();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async crearConsejo(req, res) {
        try {
            const resultado = await authService.crearConsejo(req.body);
            res.status(201).json({
                success: true,
                message: 'Consejo creado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // =============================
    // 🔹 PREGUNTAS FRECUENTES
    // =============================
    async listarPreguntas(req, res) {
        try {
            const resultado = await authService.listarPreguntas();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async crearPregunta(req, res) {
        try {
            const resultado = await authService.crearPregunta(req.body, req.user.id);
            res.status(201).json({
                success: true,
                message: 'Pregunta registrada correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    // =============================
// 🔹 CRUD DE USUARIOS
// =============================
async listarUsuarios(req, res) {
        try {
            const resultado = await authService.listarUsuarios();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async obtenerUsuario(req, res) {
        try {
            const { id } = req.params;
            const resultado = await authService.obtenerUsuario(id);
            if (!resultado) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async actualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const resultado = await authService.actualizarUsuario(id, req.body);
            res.json({
                success: true,
                message: 'Usuario actualizado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async eliminarUsuario(req, res) {
        try {
            const { id } = req.params;
            await authService.eliminarUsuario(id);
            res.json({
                success: true,
                message: 'Usuario eliminado correctamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};