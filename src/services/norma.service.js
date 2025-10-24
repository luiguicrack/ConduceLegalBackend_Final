const db = require('../config/database');

class Norma {
    // Obtener todas las normas con paginación
    static async getAll(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT n.*, c.nombre as categoria_nombre, e.nombre as estado_nombre 
      FROM normas n 
      LEFT JOIN categorias c ON n.id_categoria = c.id_categoria 
      LEFT JOIN estados e ON n.id_estado = e.id_estado
    `;
        let countQuery = 'SELECT COUNT(*) as total FROM normas n';
        const params = [];
        const conditions = [];

        // Filtros
        if (filters.categoria) {
            conditions.push('n.id_categoria = ?');
            params.push(filters.categoria);
        }

        if (filters.estado) {
            conditions.push('n.id_estado = ?');
            params.push(filters.estado);
        }

        if (filters.search) {
            conditions.push('(n.titulo_norma LIKE ? OR n.descriptcion LIKE ?)');
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY n.fecha_creacion DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [normas] = await db.promise().execute(query, params);
        const [totalResult] = await db.promise().execute(countQuery, params.slice(0, -2));

        return {
            normas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalResult[0].total,
                totalPages: Math.ceil(totalResult[0].total / limit)
            }
        };
    }

    // Obtener norma por ID
    static async getById(id) {
        const query = `
      SELECT n.*, c.nombre as categoria_nombre, e.nombre as estado_nombre 
      FROM normas n 
      LEFT JOIN categorias c ON n.id_categoria = c.id_categoria 
      LEFT JOIN estados e ON n.id_estado = e.id_estado 
      WHERE n.id_norma = ?
    `;
        const [normas] = await db.promise().execute(query, [id]);
        return normas[0] || null;
    }

    // Obtener norma por número (para verificar duplicados)
    static async getByNumero(numero_norma, excludeId = null) {
        let query = 'SELECT * FROM normas WHERE numero_norma = ?';
        const params = [numero_norma];

        if (excludeId) {
            query += ' AND id_norma != ?';
            params.push(excludeId);
        }

        const [normas] = await db.promise().execute(query, params);
        return normas[0] || null;
    }

    // Crear nueva norma
    static async create(normaData) {
        const {
            numero_norma,
            titulo_norma,
            id_categoria,
            id_estado,
            descriptcion,
            fuente,
            fecha_emicion,
            id_Cnorma
        } = normaData;

        const query = `
      INSERT INTO normas 
      (numero_norma, titulo_norma, id_categoria, id_estado, descriptcion, fuente, fecha_emicion, id_Cnorma) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result] = await db.promise().execute(query, [
            numero_norma, titulo_norma, id_categoria, id_estado,
            descriptcion, fuente, fecha_emicion, id_Cnorma
        ]);
        return result.insertId;
    }

    // Actualizar norma
    static async update(id, normaData) {
        const {
            numero_norma,
            titulo_norma,
            id_categoria,
            id_estado,
            descriptcion,
            fuente,
            fecha_emicion,
            id_Cnorma
        } = normaData;

        const query = `a
      UPDATE normas 
      SET numero_norma = ?, titulo_norma = ?, id_categoria = ?, id_estado = ?, 
          descriptcion = ?, fuente = ?, fecha_emicion = ?, id_Cnorma = ? 
      WHERE id_norma = ?
    `;

        const [result] = await db.promise().execute(query, [
            numero_norma, titulo_norma, id_categoria, id_estado,
            descriptcion, fuente, fecha_emicion, id_Cnorma, id
        ]);
        return result.affectedRows > 0;
    }

    // Eliminar norma
    static async delete(id) {
        const query = 'DELETE FROM normas WHERE id_norma = ?';
        const [result] = await db.promise().execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Obtener categorías
    static async getCategorias() {
        const query = 'SELECT * FROM categorias WHERE estado = "Activo" ORDER BY nombre';
        const [categorias] = await db.promise().execute(query);
        return categorias;
    }

    // Obtener estados
    static async getEstados() {
        const query = 'SELECT * FROM estados ORDER BY nombre';
        const [estados] = await db.promise().execute(query);
        return estados;
    }
}

module.exports = Norma;