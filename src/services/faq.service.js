import db from '../config/database.config.js';

class FAQModel {
    // Obtener todas las categorías (fijas ya que no tienes tabla categorias)
    static async getCategorias() {
        return [
            {
                id_categoria: 1,
                nombre_categoria: 'Uso del Sistema',
                descripcion: 'Preguntas sobre cómo utilizar la plataforma',
                icono: '💻',
                orden: 1
            },
            {
                id_categoria: 2,
                nombre_categoria: 'Normatividad Vial',
                descripcion: 'Dudas sobre leyes y regulaciones de tránsito',
                icono: '📚',
                orden: 2
            },
            {
                id_categoria: 3,
                nombre_categoria: 'Multas y Sanciones',
                descripcion: 'Información sobre infracciones y penalizaciones',
                icono: '🚨',
                orden: 3
            },
            {
                id_categoria: 4,
                nombre_categoria: 'Cuenta y Perfil',
                descripcion: 'Gestión de usuario y configuración de cuenta',
                icono: '👤',
                orden: 4
            }
        ];
    }

    // Obtener preguntas por categoría
    static async getPreguntasPorCategoria(idCategoria) {
        try {
            const [preguntas] = await db.execute(
                `SELECT 
           id_pregunta, 
           titulo_pregunta as pregunta, 
           respuesta,
           fecha_creacion
         FROM preguntas 
         WHERE id_categoria = ?
         ORDER BY fecha_creacion DESC`,
                [idCategoria]
            );
            return preguntas;
        } catch (error) {
            throw new Error(`Error obteniendo preguntas: ${error.message}`);
        }
    }

    // Obtener todas las preguntas
    static async getAllPreguntas() {
        try {
            const [preguntas] = await db.execute(
                `SELECT 
           id_pregunta,
           titulo_pregunta as pregunta,
           respuesta,
           id_categoria,
           fecha_creacion
         FROM preguntas 
         ORDER BY id_categoria ASC, fecha_creacion DESC`
            );
            return preguntas;
        } catch (error) {
            throw new Error(`Error obteniendo todas las preguntas: ${error.message}`);
        }
    }

    // Buscar preguntas
    static async buscarPreguntas(termino) {
        try {
            const [resultados] = await db.execute(
                `SELECT 
           id_pregunta,
           titulo_pregunta as pregunta,
           respuesta,
           id_categoria
         FROM preguntas 
         WHERE titulo_pregunta LIKE ? OR respuesta LIKE ?
         ORDER BY 
           CASE 
             WHEN titulo_pregunta LIKE ? THEN 1
             WHEN respuesta LIKE ? THEN 2
             ELSE 3
           END ASC`,
                [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`]
            );
            return resultados;
        } catch (error) {
            throw new Error(`Error buscando preguntas: ${error.message}`);
        }
    }

    // Insertar datos de ejemplo si no existen
    static async inicializarDatosEjemplo() {
        try {
            const [existing] = await db.execute('SELECT COUNT(*) as count FROM preguntas');

            if (existing[0].count === 0) {
                console.log('📝 Insertando datos de ejemplo en preguntas...');

                const preguntasEjemplo = [
                    [1, '¿Cómo puedo registrarme en el sistema?', 'Para registrarte, haz clic en el botón "Registrarse" en la esquina superior derecha, completa el formulario con tus datos personales y verifica tu correo electrónico.', 1],
                    [1, '¿Olvidé mi contraseña, cómo la recupero?', 'Haz clic en "¿Olvidaste tu contraseña?" en la página de login, ingresa tu correo electrónico y sigue las instrucciones que recibirás por email.', 1],
                    [2, '¿Qué documentación debo llevar siempre al conducir?', 'Debes portar: Licencia de conducción vigente, SOAT actualizado, Tarjeta de propiedad y Documento de identificación personal.', 1],
                    [2, '¿Cuál es el límite de velocidad en zona urbana?', 'El límite de velocidad en zona urbana es de 60 km/h para vehículos particulares, a menos que la señalización indique lo contrario.', 1],
                    [3, '¿Qué hacer si recibo una multa de tránsito?', 'Puedes consultar la multa en el sistema, verificar los detalles y seguir el proceso de impugnación si consideras que fue aplicada incorrectamente.', 1],
                    [4, '¿Cómo actualizo mi información personal?', 'Accede a "Mi Perfil" en el menú principal, haz clic en "Editar Información" y guarda los cambios realizados.', 1]
                ];

                for (const [id_categoria, titulo_pregunta, respuesta, id_usuario] of preguntasEjemplo) {
                    await db.execute(
                        'INSERT INTO preguntas (id_categoria, titulo_pregunta, respuesta, id_usuario) VALUES (?, ?, ?, ?)',
                        [id_categoria, titulo_pregunta, respuesta, id_usuario]
                    );
                }

                console.log('✅ Datos de ejemplo insertados correctamente');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error insertando datos de ejemplo:', error);
            return false;
        }
    }
}

export default FAQModel;