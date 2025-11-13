import db from '../config/database.config.js';

class FAQModel {
    // ✅ Verificar conexión a la base de datos
    static async verificarConexion() {
        try {
            const [result] = await db.execute('SELECT COUNT(*) as total FROM preguntas');
            console.log(`✅ [FAQ] Conectado a BD. Tabla preguntas tiene ${result[0].total} registros`);
            return true;
        } catch (error) {
            console.error('❌ [FAQ] Error conectando a la base de datos:', error.message);
            throw error;
        }
    }

    // ✅ Obtener todas las preguntas
    static async getAllPreguntas() {
        try {
            const [preguntas] = await db.execute(
                `SELECT 
                    id_pregunta, 
                    titulo_pregunta AS pregunta, 
                    respuesta, 
                    fecha_creacion 
                 FROM preguntas 
                 ORDER BY fecha_creacion DESC`
            );
            return preguntas;
        } catch (error) {
            console.error('❌ [FAQ] Error en getAllPreguntas:', error);
            throw error;
        }
    }

    // ✅ Buscar preguntas por término
    static async buscarPreguntas(termino) {
        try {
            const terminoBusqueda = `%${termino}%`;
            const [resultados] = await db.execute(
                `SELECT 
                    id_pregunta, 
                    titulo_pregunta AS pregunta, 
                    respuesta, 
                    fecha_creacion
                 FROM preguntas 
                 WHERE titulo_pregunta LIKE ? OR respuesta LIKE ?
                 ORDER BY 
                    CASE 
                        WHEN titulo_pregunta LIKE ? THEN 1 
                        ELSE 2 
                    END,
                    fecha_creacion DESC`,
                [terminoBusqueda, terminoBusqueda, terminoBusqueda]
            );
            return resultados;
        } catch (error) {
            console.error('❌ [FAQ] Error en buscarPreguntas:', error);
            throw error;
        }
    }

    // ✅ Obtener pregunta por ID
    static async getPreguntaById(idPregunta) {
        try {
            const [preguntas] = await db.execute(
                `SELECT 
                    id_pregunta, 
                    titulo_pregunta AS pregunta, 
                    respuesta, 
                    fecha_creacion 
                 FROM preguntas 
                 WHERE id_pregunta = ?`,
                [idPregunta]
            );
            return preguntas.length > 0 ? preguntas[0] : null;
        } catch (error) {
            console.error('❌ [FAQ] Error en getPreguntaById:', error);
            throw error;
        }
    }

    // ✅ Obtener preguntas recientes
    static async getPreguntasRecientes(limite = 5) {
        try {
            const [preguntas] = await db.execute(
                `SELECT 
                    id_pregunta, 
                    titulo_pregunta AS pregunta, 
                    respuesta, 
                    fecha_creacion 
                 FROM preguntas 
                 ORDER BY fecha_creacion DESC 
                 LIMIT ?`,
                [limite]
            );
            return preguntas;
        } catch (error) {
            console.error('❌ [FAQ] Error en getPreguntasRecientes:', error);
            throw error;
        }
    }

    // ✅ Crear nueva pregunta (sin necesidad de id_usuario)
    static async crearPregunta(preguntaData) {
        try {
            const { titulo_pregunta, respuesta, id_usuario, id_categoria = 1 } = preguntaData;

            const categoriaValida = id_categoria === 1 || id_categoria === 2;
            if (!categoriaValida) {
                throw new Error('La categoría debe ser 1 (carro) o 2 (moto)');
            }

            const [result] = await db.execute(
                `INSERT INTO preguntas (titulo_pregunta, respuesta, id_usuario, id_categoria, fecha_creacion) 
                 VALUES (?, ?, ?, ?, NOW())`,
                [titulo_pregunta, respuesta, id_usuario || null, id_categoria]
            );

            return {
                id_pregunta: result.insertId,
                titulo_pregunta,
                respuesta,
                id_usuario: id_usuario || null,
                id_categoria,
                fecha_creacion: new Date()
            };
        } catch (error) {
            console.error('❌ [FAQ] Error al crear pregunta:', error);
            throw error;
        }
    }

    // ✅ Obtener preguntas por usuario
    static async getPreguntasPorUsuario(idUsuario) {
        try {
            const [preguntas] = await db.execute(
                `SELECT 
                    id_pregunta, 
                    titulo_pregunta AS pregunta, 
                    respuesta, 
                    fecha_creacion 
                 FROM preguntas 
                 WHERE id_usuario = ? 
                 ORDER BY fecha_creacion DESC`,
                [idUsuario]
            );
            return preguntas;
        } catch (error) {
            console.error('❌ [FAQ] Error al obtener preguntas del usuario:', error);
            throw error;
        }
    }

    // ✅ Eliminar pregunta por ID
    static async eliminarPregunta(idPregunta) {
        try {
            const [resultado] = await db.execute(
                `DELETE FROM preguntas WHERE id_pregunta = ?`,
                [idPregunta]
            );

            if (resultado.affectedRows === 0) {
                return { success: false, message: 'No se encontró la pregunta para eliminar' };
            }

            return { success: true, message: 'Pregunta eliminada exitosamente' };
        } catch (error) {
            console.error('❌ [FAQ] Error al eliminar pregunta:', error);
            throw error;
        }
    }
}

export default FAQModel;
