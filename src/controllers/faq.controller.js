import FAQModel from '../services/faq.service.js';

class FAQController {
    // Obtener todas las categorías con sus preguntas
    static async getCategoriasConPreguntas(req, res) {
        try {
            console.log('📋 [FAQ] Solicitando categorías con preguntas...');

            // Inicializar datos si es necesario
            await FAQModel.inicializarDatosEjemplo();

            const categorias = await FAQModel.getCategorias();

            // Para cada categoría, obtener sus preguntas
            const categoriasConPreguntas = await Promise.all(
                categorias.map(async (categoria) => {
                    const preguntas = await FAQModel.getPreguntasPorCategoria(categoria.id_categoria);
                    return {
                        id_categoria: categoria.id_categoria,
                        nombre_categoria: categoria.nombre_categoria,
                        descripcion: categoria.descripcion,
                        icono: categoria.icono,
                        orden: categoria.orden,
                        preguntas: preguntas.map(p => ({
                            id_pregunta: p.id_pregunta,
                            pregunta: p.pregunta,
                            respuesta: p.respuesta,
                            fecha_creacion: p.fecha_creacion
                        }))
                    };
                })
            );

            console.log(`✅ [FAQ] Enviadas ${categoriasConPreguntas.length} categorías con preguntas`);

            res.json({
                success: true,
                data: categoriasConPreguntas,
                message: 'Categorías y preguntas obtenidas exitosamente',
                metadata: {
                    total_categorias: categoriasConPreguntas.length,
                    total_preguntas: categoriasConPreguntas.reduce((acc, cat) => acc + cat.preguntas.length, 0),
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ [FAQ] Error en getCategoriasConPreguntas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las preguntas frecuentes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener todas las preguntas (formato plano para búsqueda)
    static async getAllPreguntas(req, res) {
        try {
            console.log('🔍 [FAQ] Solicitando todas las preguntas...');

            const preguntas = await FAQModel.getAllPreguntas();

            console.log(`✅ [FAQ] Enviadas ${preguntas.length} preguntas`);

            res.json({
                success: true,
                data: preguntas,
                message: 'Todas las preguntas obtenidas exitosamente',
                metadata: {
                    total_preguntas: preguntas.length,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ [FAQ] Error en getAllPreguntas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las preguntas',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Buscar preguntas por término
    static async buscarPreguntas(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'El término de búsqueda debe tener al menos 2 caracteres'
                });
            }

            const termino = q.trim();
            console.log(`🔎 [FAQ] Búsqueda: "${termino}"`);

            const resultados = await FAQModel.buscarPreguntas(termino);

            console.log(`✅ [FAQ] Encontrados ${resultados.length} resultados para "${termino}"`);

            res.json({
                success: true,
                data: resultados,
                message: `Búsqueda completada para "${termino}"`,
                metadata: {
                    termino_busqueda: termino,
                    total_resultados: resultados.length,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ [FAQ] Error en buscarPreguntas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar preguntas',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener pregunta específica por ID
    static async getPreguntaById(req, res) {
        try {
            const { id } = req.params;

            console.log(`📖 [FAQ] Solicitando pregunta ID: ${id}`);

            const [preguntas] = await db.execute(
                'SELECT id_pregunta, titulo_pregunta as pregunta, respuesta, id_categoria, fecha_creacion FROM preguntas WHERE id_pregunta = ?',
                [id]
            );

            if (preguntas.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pregunta no encontrada'
                });
            }

            const pregunta = preguntas[0];

            console.log(`✅ [FAQ] Pregunta ${id} enviada`);

            res.json({
                success: true,
                data: pregunta,
                message: 'Pregunta obtenida exitosamente'
            });

        } catch (error) {
            console.error('❌ [FAQ] Error en getPreguntaById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener la pregunta'
            });
        }
    }
}

export default FAQController;