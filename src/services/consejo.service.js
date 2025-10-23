import db from '../config/database.config.js';

class ConsejoService {
    async listar() {
        try {
            const [rows] = await db.execute(
                `SELECT c.*, cat.nombre_categoria, e.nombre_estado, n.titulo_norma 
                 FROM consejo c
                 LEFT JOIN categoria cat ON c.id_categoria = cat.id_categoria
                 LEFT JOIN estado e ON c.id_estado = e.id_estado
                 LEFT JOIN normatividad n ON c.id_norma = n.id_norma
                 ORDER BY c.fecha_creacion DESC`
            );
            return rows;
        } catch (error) {
            throw new Error(`Error al listar consejos: ${error.message}`);
        }
    }

    async obtener(id_consejo) {
        try {
            const [rows] = await db.execute(
                `SELECT c.*, cat.nombre_categoria, e.nombre_estado, n.titulo_norma 
                 FROM consejo c
                 LEFT JOIN categoria cat ON c.id_categoria = cat.id_categoria
                 LEFT JOIN estado e ON c.id_estado = e.id_estado
                 LEFT JOIN normatividad n ON c.id_norma = n.id_norma
                 WHERE c.id_consejo = ?`,
                [id_consejo]
            );
            if (rows.length === 0) throw new Error('Consejo no encontrado');
            return rows[0];
        } catch (error) {
            throw new Error(`Error al obtener el consejo: ${error.message}`);
        }
    }

    async crear(data) {
        try {
            const { numero_consejo, titulo_consejo, id_categoria, id_estado, descripcion, id_norma } = data;
            if (!titulo_consejo || !descripcion) {
                throw new Error('El título y la descripción son obligatorios');
            }
            const fecha_creacion = new Date();

            const [result] = await db.execute(
                `INSERT INTO consejo (numero_consejo, titulo_consejo, id_categoria, id_estado, descripcion, fecha_creacion, id_norma) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [numero_consejo, titulo_consejo, id_categoria, id_estado, descripcion, fecha_creacion, id_norma]
            );

            return { id_consejo: result.insertId, mensaje: 'Consejo creado exitosamente' };
        } catch (error) {
            throw new Error(`Error al crear el consejo: ${error.message}`);
        }
    }

    async actualizar(id_consejo, data) {
        try {
            const campos = [];
            const valores = [];

            if (data.numero_consejo) { campos.push('numero_consejo = ?'); valores.push(data.numero_consejo); }
            if (data.titulo_consejo) { campos.push('titulo_consejo = ?'); valores.push(data.titulo_consejo); }
            if (data.descripcion) { campos.push('descripcion = ?'); valores.push(data.descripcion); }
            if (data.id_categoria) { campos.push('id_categoria = ?'); valores.push(data.id_categoria); }
            if (data.id_estado) { campos.push('id_estado = ?'); valores.push(data.id_estado); }
            if (data.id_norma) { campos.push('id_norma = ?'); valores.push(data.id_norma); }

            if (campos.length === 0) throw new Error('No se enviaron campos para actualizar');

            valores.push(id_consejo);

            const [result] = await db.execute(
                `UPDATE consejo SET ${campos.join(', ')} WHERE id_consejo = ?`,
                valores
            );

            if (result.affectedRows === 0) throw new Error('Consejo no encontrado o sin cambios');

            const [actualizado] = await db.execute(`SELECT * FROM consejo WHERE id_consejo = ?`, [id_consejo]);
            return actualizado[0];
        } catch (error) {
            throw new Error(`Error al actualizar el consejo: ${error.message}`);
        }
    }

    async eliminar(id_consejo) {
        try {
            const [result] = await db.execute(`DELETE FROM consejo WHERE id_consejo = ?`, [id_consejo]);
            if (result.affectedRows === 0) throw new Error('Consejo no encontrado');
            return { mensaje: 'Consejo eliminado correctamente' };
        } catch (error) {
            throw new Error(`Error al eliminar el consejo: ${error.message}`);
        }
    }
}

export default new ConsejoService();
