import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import moment from "moment";
import db from "../config/database.config.js";

export const generateReportPDF = async (userName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const uploadDir = path.join(process.cwd(), "src", "uploads");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, `Reporte_${userName}_${Date.now()}.pdf`);
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // === FONDO GRIS CLARO ===
            doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f5f5f5");
            doc.fillColor("black");

            // === ENCABEZADO ===
            doc.save();
            doc.rect(0, 0, doc.page.width, 80).fill("#003366");

            const logoPath = path.join(uploadDir, "logoConduceLegal.png");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, 15, { width: 60 });
            }

            doc.font("Helvetica-Bold").fontSize(22).fillColor("white").text("Conduce Legal", 120, 25);
            doc.fontSize(12).fillColor("white").text("Reporte General del Sistema", 120, 50);

            const fecha = moment().format("DD/MM/YYYY HH:mm:ss");
            doc.font("Helvetica").fontSize(10).fillColor("white").text(`Usuario: ${userName}`, 430, 25);
            doc.text(`Fecha: ${fecha}`, 430, 40);
            doc.restore();

            // === ESPACIADO ===
            doc.moveDown(3);
            doc.fillColor("black");

            // === CONSULTA DE DATOS ===
            const [normas] = await db.execute(`SELECT titulo_norma AS titulo, descripcion FROM normatividad`);
            const [noticias] = await db.execute(`SELECT titulo_noticia AS titulo, contenido_noticia AS descripcion FROM noticia`);
            const [consejos] = await db.execute(`SELECT titulo_consejo AS titulo, descripcion FROM consejo`);
            const [preguntas] = await db.execute(`SELECT titulo_pregunta AS titulo, respuesta AS descripcion FROM preguntas`);

            const secciones = [
                { titulo: "NORMAS DE TRÁNSITO", color: "#004aad", datos: normas },
                { titulo: "NOTICIAS", color: "#0077b6", datos: noticias },
                { titulo: "CONSEJOS", color: "#009e60", datos: consejos },
                { titulo: "PREGUNTAS FRECUENTES", color: "#f39c12", datos: preguntas },
            ];

            // === SECCIONES ===
            for (const seccion of secciones) {
                if (doc.y > 650) doc.addPage();

                // TÍTULO DE SECCIÓN
                doc.moveDown(1);
                doc.save();
                doc.rect(40, doc.y - 5, doc.page.width - 80, 25).fill(seccion.color);
                doc.fillColor("white").font("Helvetica-Bold").fontSize(14).text(seccion.titulo, 55, doc.y - 3);
                doc.restore();
                doc.moveDown(1.5);

                if (seccion.datos.length === 0) {
                    doc.font("Helvetica-Oblique").fontSize(12).fillColor("gray").text("No hay datos disponibles.\n");
                    continue;
                }

                // ENCABEZADO DE TABLA
                const headerY = doc.y;
                doc.rect(50, headerY, 500, 22).fill("#d9d9d9");
                doc.fillColor("#003366").font("Helvetica-Bold").fontSize(12);
                doc.text("Título", 60, headerY + 5);
                doc.text("Descripción", 260, headerY + 5);
                doc.moveDown(2);

                // FILAS
                seccion.datos.forEach((item, index) => {
                    if (doc.y > 720) doc.addPage();

                    const startY = doc.y;
                    const rowColor = index % 2 === 0 ? "#ffffff" : "#f1f1f1";

                    doc.save();
                    doc.rect(50, startY - 2, 500, 40).fill(rowColor).strokeColor("#cccccc").stroke();
                    doc.restore();

                    doc.font("Helvetica-Bold").fontSize(11).fillColor("#003366").text(`${index + 1}. ${item.titulo}`, 60, startY + 8, {
                        width: 180,
                        lineGap: 2,
                    });

                    doc.font("Helvetica").fontSize(10).fillColor("black").text(item.descripcion || "Sin descripción.", 250, startY + 8, {
                        width: 280,
                        align: "justify",
                        lineGap: 2,
                    });

                    doc.moveDown(2.3);
                });

                doc.moveDown(1);
            }

            // === PIE DE PÁGINA ===
            const footerText = "© 2025 Conduce Legal - Todos los derechos reservados";
            doc.font("Helvetica-Oblique").fontSize(10).fillColor("gray").text(footerText, 0, doc.page.height - 80, {
                align: "center",
                width: doc.page.width,
            });

            // FINALIZAR PDF
            doc.end();
            stream.on("finish", () => resolve(filePath));
            stream.on("error", (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
};
