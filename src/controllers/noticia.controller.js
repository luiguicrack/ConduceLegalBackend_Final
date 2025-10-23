import noticiaService from '../services/noticia.service.js';

export const noticiaController = {
    async listar(req, res) {
        try {
            const resultado = await noticiaService.listar();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async obtener(req, res) {
        try {
            const { id } = req.params;
            const resultado = await noticiaService.obtener(id);
            if (!resultado) {
                return res.status(404).json({ success: false, message: 'Noticia no encontrada' });
            }
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async crear(req, res) {
        try {
            const resultado = await noticiaService.crear(req.body);
            res.status(201).json({
                success: true,
                message: 'Noticia creada correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await noticiaService.actualizar(id, req.body);
            res.json({
                success: true,
                message: 'Noticia actualizada correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async eliminar(req, res) {
        try {
            const { id } = req.params;
            await noticiaService.eliminar(id);
            res.json({
                success: true,
                message: 'Noticia eliminada correctamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
