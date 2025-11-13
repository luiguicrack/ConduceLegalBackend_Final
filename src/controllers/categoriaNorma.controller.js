import CategoriaNormaService from "../services/categoriaNorma.service.js";

class CategoriaNormaController {
    async listar(req, res) {
        try {
            const categoriasNorma = await CategoriaNormaService.obtenerTodas();
            res.status(200).json(categoriasNorma);
        } catch (error) {
            console.error("Error al obtener las categorías de norma:", error);
            res.status(500).json({ message: "Error al obtener las categorías de norma" });
        }
    }
}

export default new CategoriaNormaController();
