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

// ================== CORS CONFIG RENDER ===================
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true
}));

// ================== SWAGGER CONFIG ======================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Conduce Legal API',
            version: '1.0.0',
            description:
                'API para educación vial y consulta de normativas de tránsito.\n\n' +
                '**Documentación relacionada:**\n' +
                '- Trello Conduce Legal\n' +
                '- Google Sheets Backlog\n' +
                '- Google Drive Documentación\n',
            contact: {
                name: 'Equipo Conduce Legal',
                email: 'equipo@conducelegal.com'
            }
        },
        servers: [
            {
                url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`,
                description: 'Servidor API'
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

// ================== MIDDLEWARES ======================
app.use(express.json());

// ================== SWAGGER UI =======================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================== ENDPOINTS BASE ===================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Conduce Legal Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a Conduce Legal API',
        documentation: '/api-docs',
        health: '/api/health'
    });
});

// ================== RUTAS API ========================
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

// ================== RUTA 404 =========================
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        route: req.originalUrl,
        docs: '/api-docs',
        health: '/api/health'
    });
});

// ================== INICIO SERVIDOR RENDER =======================
app.listen(PORT, "0.0.0.0", () => {
    console.log('====================================');
    console.log(' CONDUCE LEGAL - BACKEND DEPLOY READY');
    console.log('====================================');
    console.log(` Puerto: ${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);    
    console.log('====================================');
});
