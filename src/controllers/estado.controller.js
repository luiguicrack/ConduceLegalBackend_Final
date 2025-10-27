import EstadoService from "../services/estado.service.js";

class EstadoController {
    async listar(req, res) {
        try {
            const estados = await EstadoService.listar();
            res.status(200).json(estados);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new EstadoController();
