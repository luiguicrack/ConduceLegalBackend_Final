import pool from '../config/database.config.js';

// =====================
// Crear nueva norma
// =====================
export const createNorma = async (req, res) => {
    try {
        const {
            numero_norma,
            titulo_norma,
            id_categoria,
            id_Cnorma,
            descripcion,
            fuente,
            fecha_emicion,
            id_estado
        } = req.body;

        // Validación de campos obligatorios
        if (!numero_norma || !titulo_norma || !id_categoria || !id_Cnorma || !descripcion) {
            return res.status(400).json({
                success: false,
                message: "Número, título, categoría, tipo y descripción son requeridos"
            });
        }

        // Si no se envía estado, usar "Borrador" (id 5) como predeterminado
        const estado = id_estado || 5;

        // Inserción en la base de datos
        const [result] = await pool.execute(
            `
            INSERT INTO normatividad 
            (numero_norma, titulo_norma, id_categoria, id_Cnorma, descripcion, fuente, fecha_emicion, id_estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [numero_norma, titulo_norma, id_categoria, id_Cnorma, descripcion, fuente, fecha_emicion, estado]
        );

        res.status(201).json({
            success: true,
            message: "Norma creada exitosamente",
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error("Error creando norma:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear la norma",
            error: error.message
        });
    }
};



// =====================
// Obtener todas las normas
// =====================
export const getNormas = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM normatividad");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error obteniendo normas:", error);
        res.status(500).json({ message: "Error obteniendo normas" });
    }
};

// =====================
// Obtener una norma por ID
// =====================
export const getNormaById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM normatividad WHERE id_norma = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Norma no encontrada" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error obteniendo norma:", error);
        res.status(500).json({ message: "Error obteniendo norma" });
    }
};

// =====================
// Actualizar norma
// =====================
export const updateNorma = async (req, res) => {
    const { id } = req.params;
    const {
        numero_norma,
        titulo_norma,
        id_categoria,
        id_Cnorma,
        descripcion,
        fuente,
        fecha_emicion
    } = req.body;

    try {
        const [result] = await pool.execute(
            `
            UPDATE normatividad 
            SET numero_norma = ?, titulo_norma = ?, id_categoria = ?, id_Cnorma = ?, descripcion = ?, fuente = ?, fecha_emicion = ?
            WHERE id_norma = ?
            `,
            [numero_norma, titulo_norma, id_categoria, id_Cnorma, descripcion, fuente, fecha_emicion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Norma no encontrada" });
        }

        res.status(200).json({ message: "Norma actualizada correctamente" });
    } catch (error) {
        console.error("Error actualizando norma:", error);
        res.status(500).json({ message: "Error actualizando norma" });
    }
};

// =====================
// Eliminar norma
// =====================
export const deleteNorma = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute("DELETE FROM normatividad WHERE id_norma = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Norma no encontrada" });
        }

        res.status(200).json({ message: "Norma eliminada correctamente" });
    } catch (error) {
        console.error("Error eliminando norma:", error);
        res.status(500).json({ message: "Error eliminando norma" });
    }
};
