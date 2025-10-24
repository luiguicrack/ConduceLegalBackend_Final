import db from '../config/database.config.js';

class NormasController {
    // Obtener todas las normas con paginación
    async getNormas(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
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
            if (req.query.categoria) {
                conditions.push('n.id_categoria = ?');
                params.push(req.query.categoria);
            }

            if (req.query.estado) {
                conditions.push('n.id_estado = ?');
                params.push(req.query.estado);
            }

            if (req.query.search) {
                conditions.push('(n.titulo_norma LIKE ? OR n.descriptcion LIKE ?)');
                const searchTerm = `%${req.query.search}%`;
                params.push(searchTerm, searchTerm);
            }

            if (conditions.length > 0) {
                const whereClause = ' WHERE ' + conditions.join(' AND ');
                query += whereClause;
                countQuery += whereClause;
            }

            query += ' ORDER BY n.fecha_creacion DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);

            const [normas] = await db.execute(query, params);
            const [totalResult] = await db.execute(countQuery, params.slice(0, -2));

            res.json({
                success: true,
                data: normas,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalResult[0].total,
                    totalPages: Math.ceil(totalResult[0].total / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo normas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener norma por ID
    async getNormaById(req, res) {
        try {
            const query = `
                SELECT n.*, c.nombre as categoria_nombre, e.nombre as estado_nombre 
                FROM normas n 
                LEFT JOIN categorias c ON n.id_categoria = c.id_categoria 
                LEFT JOIN estados e ON n.id_estado = e.id_estado 
                WHERE n.id_norma = ?
            `;
            const [normas] = await db.execute(query, [req.params.id]);

            if (normas.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Norma no encontrada'
                });
            }

            res.json({
                success: true,
                data: normas[0]
            });
        } catch (error) {
            console.error('Error obteniendo norma:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear nueva norma
    async createNorma(req, res) {
        try {
            const {
                numero_norma,
                titulo_norma,
                id_categoria,
                id_estado,
                descriptcion,
                fuente,
                fecha_emicion,
                id_Cnorma
            } = req.body;

            // Validaciones
            if (!numero_norma || !titulo_norma || !id_categoria || !id_estado || !descriptcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Número, título, categoría, estado y descripción son requeridos'
                });
            }

            // Verificar que el número de norma no esté repetido
            const [normaExistente] = await db.execute(
                'SELECT id_norma FROM normas WHERE numero_norma = ?',
                [numero_norma]
            );

            if (normaExistente.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El número de norma ya existe'
                });
            }

            const query = `
                INSERT INTO normas 
                (numero_norma, titulo_norma, id_categoria, id_estado, descriptcion, fuente, fecha_emicion, id_Cnorma) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                numero_norma, titulo_norma, id_categoria, id_estado,
                descriptcion, fuente, fecha_emicion, id_Cnorma
            ]);

            res.status(201).json({
                success: true,
                message: 'Norma creada exitosamente',
                data: { id_norma: result.insertId }
            });
        } catch (error) {
            console.error('Error creando norma:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar norma
    async updateNorma(req, res) {
        try {
            const {
                numero_norma,
                titulo_norma,
                id_categoria,
                id_estado,
                descriptcion,
                fuente,
                fecha_emicion,
                id_Cnorma
            } = req.body;
            const id = req.params.id;

            // Validaciones
            if (!numero_norma || !titulo_norma || !id_categoria || !id_estado || !descriptcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Número, título, categoría, estado y descripción son requeridos'
                });
            }

            // Verificar que el número de norma no esté repetido (excluyendo la norma actual)
            const [normaExistente] = await db.execute(
                'SELECT id_norma FROM normas WHERE numero_norma = ? AND id_norma != ?',
                [numero_norma, id]
            );

            if (normaExistente.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El número de norma ya existe'
                });
            }

            const query = `
                UPDATE normas 
                SET numero_norma = ?, titulo_norma = ?, id_categoria = ?, id_estado = ?, 
                    descriptcion = ?, fuente = ?, fecha_emicion = ?, id_Cnorma = ? 
                WHERE id_norma = ?
            `;

            const [result] = await db.execute(query, [
                numero_norma, titulo_norma, id_categoria, id_estado,
                descriptcion, fuente, fecha_emicion, id_Cnorma, id
            ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Norma no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Norma actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando norma:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar norma
    async deleteNorma(req, res) {
        try {
            const [result] = await db.execute(
                'DELETE FROM normas WHERE id_norma = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Norma no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Norma eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando norma:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener categorías
    async getCategorias(req, res) {
        try {
            const [categorias] = await db.execute(
                'SELECT * FROM categorias WHERE estado = "Activo" ORDER BY nombre'
            );

            res.json({
                success: true,
                data: categorias
            });
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener estados
    async getEstados(req, res) {
        try {
            const [estados] = await db.execute(
                'SELECT * FROM estados ORDER BY nombre'
            );

            res.json({
                success: true,
                data: estados
            });
        } catch (error) {
            console.error('Error obteniendo estados:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Verificar número de norma único
    async verificarNumeroNorma(req, res) {
        try {
            const { numero_norma, exclude_id } = req.query;

            if (!numero_norma) {
                return res.status(400).json({
                    success: false,
                    message: 'Número de norma requerido'
                });
            }

            let query = 'SELECT id_norma FROM normas WHERE numero_norma = ?';
            const params = [numero_norma];

            if (exclude_id) {
                query += ' AND id_norma != ?';
                params.push(exclude_id);
            }

            const [normaExistente] = await db.execute(query, params);

            res.json({
                success: true,
                disponible: normaExistente.length === 0
            });
        } catch (error) {
            console.error('Error verificando número de norma:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

export default new NormasController();