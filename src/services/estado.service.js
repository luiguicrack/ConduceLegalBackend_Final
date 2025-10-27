import db from "../config/database.config.js";

class EstadoService {
    async listar() {
        const [rows] = await db.execute("SELECT id_estado, nombre_estado FROM estado");
        return rows;
    }
}

export default new EstadoService();
        