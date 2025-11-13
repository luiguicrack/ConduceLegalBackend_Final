import { generateReportPDF } from "../services/report.service.js";

export const getReport = async (req, res) => {
    try {
        const userName = req.usuario?.nombre_usuario || "Usuario desconocido"; // 🔹 del middleware JWT
        const pdfPath = await generateReportPDF(userName);

        res.download(pdfPath, (err) => {
            if (err) console.error("Error al enviar PDF:", err);
        });
    } catch (error) {
        res.status(500).json({ message: "Error al generar el reporte", error: error.message });
    }
};
