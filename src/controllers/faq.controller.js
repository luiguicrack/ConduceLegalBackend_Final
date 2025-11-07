import FAQModel from '../services/faq.service.js';

class FAQController {
    // Obtener todas las preguntas
    static async getAllPreguntas(req, res) {
        try {
            console.log('🔍 [FAQ] Solicitando todas las preguntas...');

            // Verificar conexión primero
            await FAQModel.verificarConexion();

            const preguntas = await FAQModel.getAllPreguntas();

            console.log(`✅ [FAQ] Enviadas ${preguntas.length} preguntas`);

            res.json({
                success: true,
                data: preguntas,
                message: 'Preguntas obtenidas exitosamente',
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

            const pregunta = await FAQModel.getPreguntaById(id);

            if (!pregunta) {
                return res.status(404).json({
                    success: false,
                    message: 'Pregunta no encontrada'
                });
            }

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

    // Obtener preguntas recientes
    static async getPreguntasRecientes(req, res) {
        try {
            console.log('🆕 [FAQ] Solicitando preguntas recientes...');

            const preguntas = await FAQModel.getPreguntasRecientes();

            console.log(`✅ [FAQ] Enviadas ${preguntas.length} preguntas recientes`);

            res.json({
                success: true,
                data: preguntas,
                message: 'Preguntas recientes obtenidas exitosamente',
                metadata: {
                    total_preguntas: preguntas.length,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ [FAQ] Error en getPreguntasRecientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener preguntas recientes'
            });
        }
    }

    // Crear nueva pregunta
    static async crearPregunta(req, res) {
        try {
            const { titulo_pregunta, respuesta, id_usuario } = req.body;

            // Validaciones básicas
            if (!titulo_pregunta || !respuesta) {
                return res.status(400).json({
                    success: false,
                    message: 'El título y la respuesta son obligatorios'
                });
            }

            if (titulo_pregunta.length < 5) {
                return res.status(400).json({
                    success: false,
                    message: 'El título debe tener al menos 5 caracteres'
                });
            }

            console.log(`📝 [FAQ] Creando nueva pregunta: "${titulo_pregunta}"`);

            const nuevaPregunta = await FAQModel.crearPregunta({
                titulo_pregunta: titulo_pregunta.trim(),
                respuesta: respuesta.trim(),
                id_usuario: id_usuario || 1 // Por defecto usuario 1
            });

            console.log(`✅ [FAQ] Pregunta creada con ID: ${nuevaPregunta.id_pregunta}`);

            res.status(201).json({
                success: true,
                data: nuevaPregunta,
                message: 'Pregunta creada exitosamente'
            });

        } catch (error) {
            console.error('❌ [FAQ] Error al crear pregunta:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al crear la pregunta'
            });
        }
    }

    // Obtener preguntas del usuario
    static async getMisPreguntas(req, res) {
        try {
            const { id_usuario } = req.params;
        
            console.log(`👤 [FAQ] Solicitando preguntas del usuario: ${id_usuario}`);

            const preguntas = await FAQModel.getPreguntasPorUsuario(id_usuario);

            console.log(`✅ [FAQ] Enviadas ${preguntas.length} preguntas del usuario ${id_usuario}`);

            res.json({
                success: true,
                data: preguntas,
                message: 'Preguntas del usuario obtenidas exitosamente',
                metadata: {
                    total_preguntas: preguntas.length,
                    id_usuario: parseInt(id_usuario),
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ [FAQ] Error al obtener preguntas del usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las preguntas del usuario'
            });
        }
    }
}

export default FAQController;