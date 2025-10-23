import express from "express";
import { getReport } from "../controllers/report.controller.js";
import { verificarToken } from "../middlewares/auth.middlewares.js";


const router = express.Router();

/**
 * @swagger
 * /api/report/pdf:
 *   get:
 *     summary: Generar reporte en PDF
 *     description: Genera un PDF con logo, fecha/hora y nombre del usuario autenticado.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 */
router.get("/pdf", verificarToken, getReport);


export default router;
