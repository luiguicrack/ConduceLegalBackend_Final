import db from "../config/database.config.js";

class CategoriaController {
    async listar(req, res) {
        try {
            const [rows] = await db.execute("SELECT id_categoria, nombre_categoria FROM categoria");
            res.status(200).json(rows);
        } catch (error) {
            console.error("Error al obtener las categorías:", error);
            res.status(500).json({ message: "Error al obtener las categorías" });
        }
    }
}

export default new CategoriaController();
