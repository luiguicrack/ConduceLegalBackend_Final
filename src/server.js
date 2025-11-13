import express from 'express';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import contenidoRoutes from './routes/contenido.routes.js';
import consejoRoutes from './routes/consejo.routes.js';
import authRoutes from './routes/auth.routes.js';
import reportRoutes from "./routes/report.routes.js";
import noticiaRoutes from './routes/noticia.routes.js';
import normasRoutes from './routes/normas.routes.js';
import faqRoutes from './routes/faq.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import estadoRoutes from './routes/estado.routes.js';
import categoriaNormaRoutes from "./routes/categoriaNorma.routes.js";




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: "http://localhost:3001", credentials: true }));

// Configuración Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Conduce Legal API',
            version: '1.0.0',
            description:
                'La propuesta nace ante la falta de conocimiento de muchos Conductores sobre las leyes de tránsito vigentes, lo que genera confusión y sanciones evitables. ' +
                'Se detecta la necesidad de una plataforma accesible y clara que permita consultar normativas en lenguaje sencillo y resolver dudas sobre multas e infracciones.\n\n' +
                'API para sistema de educación vial - Documentación Swagger.\n\n' +
                '**Documentación anexa:**\n' +
                '- [Trello Conduce Legal](https://trello.com/b/40EFVUGw/conduce-legal)\n' +
                '- [Google Sheets - Product Backlog](https://docs.google.com/spreadsheets/d/1SyCIVQKDo7TFxHmS_SofwogTCbBFbPjB/edit?usp=sharing&ouid=101887930250134460722&rtpof=true&sd=true)\n' +
                '- [Google Drive - Documentación](https://drive.google.com/drive/folders/15zcsjuSAXnhkae0LupokjyE-MoPDwxOT)\n',
            contact: {
                name: 'Equipo Conduce Legal',
                email: 'equipo@conducelegal.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/server.js', './src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middlewares
app.use(cors());
app.use(express.json());

// Servir documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: HU0018 - Registrar nuevo usuario
 *     description: Crea un nuevo usuario en el sistema con validación de correo único. Siempre asigna rol de Usuario (id_rol = 2)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - correo
 *               - contraseña
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "juan_perez"
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "juan@email.com"
 *               contraseña:
 *                 type: string
 *                 example: "mi_contraseña_segura"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos o usuario/correo ya existe
 *       409:
 *         description: Correo electrónico ya registrado
 */
app.post('/api/auth/registro', async (req, res) => {
    console.log(' SOLICITUD REGISTRO:', req.body);

    const { nombre_usuario, correo, contraseña } = req.body;
    const id_rol = 2;

    try {
        // Validaciones básicas
        if (!nombre_usuario || !correo || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de usuario, correo y contraseña son requeridos'
            });
        }

        // Validar formato correo
        if (!correo.includes('@') || !correo.includes('.')) {
            return res.status(400).json({
                success: false,
                message: 'El formato del correo es inválido'
            });
        }

        // Conectar a BD para verificar unicidad
        const db = await import('./config/database.config.js');

        // Verificar si el nombre de usuario ya existe
        const [existingUser] = await db.default.execute(
            'SELECT id_usuarios FROM usuarios WHERE nombre_usuario = ?',
            [nombre_usuario]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está registrado'
            });
        }

        // Verificar si el correo ya existe
        const [existingEmail] = await db.default.execute(
            'SELECT id_usuarios FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Hash de la contraseña
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash(contraseña, 10);

        // Insertar usuario en BD
        const [result] = await db.default.execute(
            'INSERT INTO usuarios (nombre_usuario, correo, contraseña, id_rol) VALUES (?, ?, ?, ?)',
            [nombre_usuario, correo, hashedPassword, id_rol]
        );

        // Registro exitoso
        res.status(201).json({
            success: true,
            message: ' Usuario registrado exitosamente!',
            data: {
                id_usuarios: result.insertId,
                nombre_usuario: nombre_usuario,
                correo: correo,
                id_rol: id_rol,
                fecha_creacion: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error(' Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: HU0019 - Iniciar sesión
 *     description: Autentica usuario por nombre_usuario o correo electrónico
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificador
 *               - contraseña
 *             properties:
 *               identificador:
 *                 type: string
 *                 description: "Nombre de usuario o correo electrónico"
 *                 example: "nuevo@email.com"
 *               contraseña:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
app.post('/api/auth/login', async (req, res) => {
    console.log(' SOLICITUD LOGIN:', req.body);

    const { identificador, contraseña } = req.body;

    try {
        if (!identificador || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Identificador y contraseña son requeridos'
            });
        }

        // Conectar a BD
        const db = await import('./config/database.config.js');
        const bcrypt = await import('bcrypt');

        // Buscar usuario por nombre_usuario O correo
        const [users] = await db.default.execute(
            `SELECT u.*, r.nombre_rol 
       FROM usuarios u 
       INNER JOIN rol r ON u.id_rol = r.id_rol 
       WHERE u.nombre_usuario = ? OR u.correo = ?`,
            [identificador, identificador]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const usuario = users[0];

        // Verificar contraseña
        const passwordValida = await bcrypt.default.compare(contraseña, usuario.contraseña);

        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const jwt = await import('jsonwebtoken');
        const jwtConfig = await import('./utilities/jwt.config.js');

        const token = jwt.default.sign(
            {
                id_usuarios: usuario.id_usuarios,
                nombre_usuario: usuario.nombre_usuario,
                correo: usuario.correo,
                id_rol: usuario.id_rol
            },
            jwtConfig.default.secret,
            { expiresIn: jwtConfig.default.expiresIn }
        );

        res.json({
            success: true,
            message: ' Login exitoso!',
            data: {
                token: token,
                usuario: {
                    id_usuarios: usuario.id_usuarios,
                    nombre_usuario: usuario.nombre_usuario,
                    correo: usuario.correo,
                    id_rol: usuario.id_rol,
                    nombre_rol: usuario.nombre_rol
                }
            }
        });

    } catch (error) {
        console.error(' Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: HU0025 - Cerrar sesión
 *     description: Invalida el token de sesión en el cliente. El backend solo responde confirmando el cierre.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: Token inválido o ausente
 */
app.post('/api/auth/logout', (req, res) => {
    console.log(' SOLICITUD LOGOUT');

    res.json({
        success: true,
        message: 'Sesión cerrada correctamente. El token debe eliminarse en el cliente.'
    });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check del servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Conduce Legal Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            documentation: '/api-docs',
            auth: {
                registro: 'POST /api/auth/registro',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout'
            }
        }
    });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página principal de la API
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Información general de la API
 */
app.get('/', (req, res) => {
    res.json({
        message: ' Bienvenido a Conduce Legal API',
        documentation: ' Visita /api-docs para documentación interactiva',
        endpoints: {
            health: 'GET /api/health',
            registro: 'POST /api/auth/registro',
            login: 'POST /api/auth/login',
            logout: 'POST /api/auth/logout',
            docs: 'GET /api-docs'
        }
    });
});

app.use('/api', contenidoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/consejos', consejoRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use("/api/report", reportRoutes);
app.use('/api/gestion', normasRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/estados', estadoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use("/api/categoria_norma", categoriaNormaRoutes);



// Manejar rutas no encontradas
app.use('*', (req, res) => {    
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        available_endpoints: [
            'GET /',
            'GET /api/health',      
            'POST /api/auth/registro',
            'POST /api/auth/login',
            'POST /api/auth/logout',
            'GET /api-docs'
        ]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('====================================');
    console.log(' CONDUCE LEGAL - BACKEND CON SWAGGER');
    console.log('====================================');
    console.log(` Puerto: ${PORT}`);
    console.log(` API: http://localhost:${PORT}`);
    console.log(` Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log('====================================');
});