import db from "../config/database.config.js";

class CategoriaService {
    async listar() {
        const [rows] = await db.execute("SELECT id_categoria, nombre_categoria FROM categoria");
        return rows;
    }
}

export default new CategoriaService();
