import db from '../config/database.config.js';

class NoticiaService {
    // 🔹 Listar todas las noticias
    async listar() {
        try {
            const [rows] = await db.execute(
                `SELECT n.*, 
                        e.nombre_estado, 
                        u.nombre_usuario, 
                        r.nombre_rol
                 FROM noticia n
                 LEFT JOIN estado e ON n.id_estado = e.id_estado
                 LEFT JOIN usuarios u ON n.id_usuarios = u.id_usuarios
                 LEFT JOIN rol r ON u.id_rol = r.id_rol
                 ORDER BY n.fecha_creacion DESC`
            );
            return rows;
        } catch (error) {
            throw new Error(`Error al listar noticias: ${error.message}`);
        }
    }

    // 🔹 Obtener noticia por ID
    async obtener(id_noticia) {
        try {
            const [rows] = await db.execute(
                `SELECT n.*, 
                        e.nombre_estado, 
                        u.nombre_usuario, 
                        r.nombre_rol
                 FROM noticia n
                 LEFT JOIN estado e ON n.id_estado = e.id_estado
                 LEFT JOIN usuarios u ON n.id_usuarios = u.id_usuarios
                 LEFT JOIN rol r ON u.id_rol = r.id_rol
                 WHERE n.id_noticia = ?`,
                [id_noticia]
            );

            if (rows.length === 0) throw new Error('Noticia no encontrada');
            return rows[0];
        } catch (error) {
            throw new Error(`Error al obtener la noticia: ${error.message}`);
        }
    }

    // 🔹 Crear nueva noticia (versión mejorada)
    async crear(data) {
        try {
            const {
                titulo_noticia,
                contenido_noticia = '',
                fecha_publicacion,
                fuente = '',
                id_estado = 1,
                id_usuarios
            } = data;

            if (!titulo_noticia) {
                throw new Error('El título de la noticia es obligatorio');
            }

            if (!id_usuarios) {
                throw new Error('Debe especificarse el usuario que crea la noticia');
            }

            // Generar fecha actual si no se envía
            const fecha = fecha_publicacion || new Date().toISOString().split('T')[0];

            const [result] = await db.execute(
                `INSERT INTO noticia 
                 (titulo_noticia, contenido_noticia, fecha_publicacion, fuente, id_estado, id_usuarios)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [titulo_noticia, contenido_noticia, fecha, fuente, id_estado, id_usuarios]
            );

            return { id_noticia: result.insertId, mensaje: 'Noticia creada exitosamente' };
        } catch (error) {
            throw new Error(`Error al crear la noticia: ${error.message}`);
        }
    }

    // 🔹 Actualizar noticia existente
    async actualizar(id_noticia, data) {
        try {
            const campos = [];
            const valores = [];

            if (data.titulo_noticia) { campos.push('titulo_noticia = ?'); valores.push(data.titulo_noticia); }
            if (data.contenido_noticia) { campos.push('contenido_noticia = ?'); valores.push(data.contenido_noticia); }
            if (data.fecha_publicacion) { campos.push('fecha_publicacion = ?'); valores.push(data.fecha_publicacion); }
            if (data.fuente) { campos.push('fuente = ?'); valores.push(data.fuente); }
            if (data.id_estado) { campos.push('id_estado = ?'); valores.push(data.id_estado); }
            if (data.id_usuarios) { campos.push('id_usuarios = ?'); valores.push(data.id_usuarios); }

            if (campos.length === 0) throw new Error('No se enviaron campos para actualizar');

            valores.push(id_noticia);

            const [result] = await db.execute(
                `UPDATE noticia SET ${campos.join(', ')} WHERE id_noticia = ?`,
                valores
            );

            if (result.affectedRows === 0) throw new Error('Noticia no encontrada o sin cambios');

            const [actualizado] = await db.execute(`SELECT * FROM noticia WHERE id_noticia = ?`, [id_noticia]);
            return actualizado[0];
        } catch (error) {
            throw new Error(`Error al actualizar la noticia: ${error.message}`);
        }
    }

    // 🔹 Eliminar noticia
    async eliminar(id_noticia) {
        try {
            const [result] = await db.execute(`DELETE FROM noticia WHERE id_noticia = ?`, [id_noticia]);
            if (result.affectedRows === 0) throw new Error('Noticia no encontrada');
            return { mensaje: 'Noticia eliminada correctamente' };
        } catch (error) {
            throw new Error(`Error al eliminar la noticia: ${error.message}`);
        }
    }
}

export default new NoticiaService();
