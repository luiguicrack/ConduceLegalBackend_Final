import consejoService from '../services/consejo.service.js';

export const consejoController = {
    async listar(req, res) {
        try {
            const resultado = await consejoService.listar();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async obtener(req, res) {
        try {
            const { id } = req.params;
            const resultado = await consejoService.obtener(id);
            if (!resultado) {
                return res.status(404).json({ success: false, message: 'Consejo no encontrado' });
            }
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async crear(req, res) {
        try {
            const resultado = await consejoService.crear(req.body);
            res.status(201).json({
                success: true,
                message: 'Consejo creado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await consejoService.actualizar(id, req.body);
            res.json({
                success: true,
                message: 'Consejo actualizado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async eliminar(req, res) {
        try {
            const { id } = req.params;
            await consejoService.eliminar(id);
            res.json({
                success: true,
                message: 'Consejo eliminado correctamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
