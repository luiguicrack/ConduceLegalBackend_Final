import db from "../config/database.config.js";

class CategoriaNormaService {
    async obtenerTodas() {
        const [rows] = await db.execute("SELECT id_Cnorma, nombre_cnorma FROM categoria_norma");
        return rows;
    }
}

export default new CategoriaNormaService();
