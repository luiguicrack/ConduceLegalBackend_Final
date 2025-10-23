import db from '../config/database.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import jwtConfig from '../utilities/jwt.config.js';
import crypto from "crypto";
import transporter from "../config/email.config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuthService {
    // =============================
    // 🔹 USUARIOS
    // =============================
    async registrarUsuario(usuarioData) {
        try {
            const { nombre_usuario, contraseña, id_rol = 2 } = usuarioData;

            const [existingUser] = await db.execute(
                'SELECT id_usuarios FROM usuarios WHERE nombre_usuario = ?',
                [nombre_usuario]
            );

            if (existingUser.length > 0) {
                throw new Error('El usuario ya existe');
            }

            const hashedPassword = await bcrypt.hash(contraseña, 10);

            const [result] = await db.execute(
                'INSERT INTO usuarios (nombre_usuario, contraseña, id_rol, estado) VALUES (?, ?, ?, ?)',
                [nombre_usuario, hashedPassword, id_rol, true]
            );

            return {
                id_usuarios: result.insertId,
                nombre_usuario,
                id_rol,
                mensaje: 'Usuario registrado exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async loginUsuario(credenciales) {
        try {
            const { nombre_usuario, contraseña } = credenciales;

            const [users] = await db.execute(
                'SELECT u.*, r.nombre_rol FROM usuarios u INNER JOIN rol r ON u.id_rol = r.id_rol WHERE u.nombre_usuario = ?',
                [nombre_usuario]
            );

            if (users.length === 0) {
                throw new Error('Credenciales inválidas');
            }

            const usuario = users[0];
            const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);

            if (!passwordValida) {
                throw new Error('Credenciales inválidas');
            }

            const token = jwt.sign(
                {
                    id_usuarios: usuario.id_usuarios,
                    nombre_usuario: usuario.nombre_usuario,
                    id_rol: usuario.id_rol
                },
                jwtConfig.secret,
                { expiresIn: jwtConfig.expiresIn }
            );

            return {
                token,
                usuario: {
                    id_usuarios: usuario.id_usuarios,
                    nombre_usuario: usuario.nombre_usuario,
                    id_rol: usuario.id_rol,
                    nombre_rol: usuario.nombre_rol
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async obtenerPerfil(id_usuario) {
        try {
            const [rows] = await db.execute(
                'SELECT u.id_usuarios, u.nombre_usuario, r.nombre_rol, u.estado FROM usuarios u INNER JOIN rol r ON u.id_rol = r.id_rol WHERE u.id_usuarios = ?',
                [id_usuario]
            );

            if (rows.length === 0) throw new Error('Usuario no encontrado');
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // =============================
    // 🔹 SOLICITAR RECUPERACIÓN DE CONTRASEÑA
    async solicitarRecuperacion(correo) {
        try {
            // Buscar usuario por correo
            const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [correo]);
            if (usuarios.length === 0) throw new Error("No existe una cuenta con ese correo");

            const usuario = usuarios[0];
            const token = crypto.randomBytes(32).toString("hex");
            const expira = new Date(Date.now() + 3600000); // 1 hora

            // Guardar token temporal
            await db.execute(
                `UPDATE usuarios SET token_recuperacion = ?, token_expira = ? WHERE id_usuarios = ?`,
                [token, expira, usuario.id_usuarios]
            );

            // Enviar correo con enlace
            const link = `http://localhost:3000/api/auth/restablecer/${token}`;// ✅ cambia según tu frontend

            await transporter.sendMail({
                from: `"Conduce Legal 🚗" <conducelegal194@gmail.com>`,
                to: correo,
                subject: "🔑 Recuperación de contraseña - Conduce Legal",
                html: `
  <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
    <img src="cid:logoConduceLegal" alt="Conduce Legal" style="width: 150px; margin-bottom: 20px;" />
    <h2 style="color: #003366;">Recuperación de contraseña</h2>
    <p style="font-size: 16px; color: #333;">
      Hola <b>${usuario.nombre_usuario}</b>, hemos recibido una solicitud para restablecer tu contraseña.<br>
      Si no fuiste tú, ignora este mensaje.
    </p>
    <a href="${link}" 
       style="background-color: #009fe3; color: white; padding: 12px 25px; text-decoration: none;
              border-radius: 6px; display: inline-block; margin-top: 15px; font-weight: bold;">
       Restablecer contraseña
    </a>
    <p style="font-size: 14px; color: #777; margin-top: 25px;">
      Este enlace expirará en 1 hora.<br>
      © 2025 Conduce Legal — Todos los derechos reservados
    </p>
  </div>
  `,
                attachments: [
                    {
                        filename: "logoConduceLegal.png",
                        path: path.join(__dirname, "../uploads/logoConduceLegal.png"), // 🔹 ruta al logo
                        cid: "logoConduceLegal" // 🔹 Content-ID usado en el <img src="cid:...">
                    }
                ]
            });

            return { mensaje: "Correo de recuperación enviado correctamente" };
        } catch (error) {
            throw new Error("Error al solicitar recuperación: " + error.message);
        }
    }

    // =============================
    // 🔹 RESTABLECER CONTRASEÑA
    async restablecerContraseña(token, nuevaContraseña) {
        try {
            const [usuarios] = await db.execute(
                "SELECT * FROM usuarios WHERE token_recuperacion = ? AND token_expira > NOW()",
                [token]
            );

            if (usuarios.length === 0) {
                throw new Error("Token inválido o expirado");
            }

            const usuario = usuarios[0];
            const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

            await db.execute(
                `UPDATE usuarios 
       SET contraseña = ?, token_recuperacion = NULL, token_expira = NULL 
       WHERE id_usuarios = ?`,
                [hashedPassword, usuario.id_usuarios]
            );

            return { mensaje: "Contraseña actualizada correctamente" };
        } catch (error) {
            throw new Error("Error al restablecer contraseña: " + error.message);
        }
    }

    // =============================
    // 🔹 BÚSQUEDA GENERAL POR PALABRA CLAVE
    // =============================
    async buscarPorPalabraClave(palabra) {
        try {
            const search = `%${palabra}%`;

            // 🔎 Buscar en normas
            const [normas] = await db.execute(
                `SELECT 
                n.id_norma AS id, 
                n.titulo_norma AS titulo, 
                n.descripcion, 
                'norma' AS tipo 
             FROM normatividad n
             WHERE n.titulo_norma LIKE ? OR n.descripcion LIKE ?`,
                [search, search]
            );

            // 🔎 Buscar en noticias (corregido)
            const [noticias] = await db.execute(
                `SELECT 
                nt.id_noticia AS id, 
                nt.titulo_noticia AS titulo, 
                nt.contenido_noticia AS descripcion, 
                'noticia' AS tipo 
             FROM noticia nt
             WHERE nt.titulo_noticia LIKE ? OR nt.contenido_noticia LIKE ?`,
                [search, search]
            );

            // 🔎 Buscar en consejos
            const [consejos] = await db.execute(
                `SELECT 
                c.id_consejo AS id, 
                c.titulo_consejo AS titulo, 
                c.descripcion, 
                'consejo' AS tipo 
             FROM consejo c
             WHERE c.titulo_consejo LIKE ? OR c.descripcion LIKE ?`,
                [search, search]
            );

            // 🔎 Buscar en preguntas
            const [preguntas] = await db.execute(
                `SELECT 
                p.id_pregunta AS id, 
                p.titulo_pregunta AS titulo, 
                p.respuesta AS descripcion, 
                'pregunta' AS tipo 
             FROM preguntas p
             WHERE p.titulo_pregunta LIKE ? OR p.respuesta LIKE ?`,
                [search, search]
            );

            const resultados = [...normas, ...noticias, ...consejos, ...preguntas];

            if (resultados.length === 0) {
                return [{ mensaje: 'No se encontraron resultados para la búsqueda.' }];
            }

            return resultados;
        } catch (error) {
            throw new Error('Error al realizar la búsqueda general: ' + error.message);
        }
    }

    // =============================
    // 🔹 FILTRAR POR TIPO DE VEHÍCULO
    // =============================
    async filtrarPorVehiculo(tipo) {
        try {
            const [rows] = await db.execute(`
            SELECT 
                n.id_norma,
                n.numero_norma,
                n.titulo_norma,
                n.descripcion,
                c.nombre_categoria,
                e.nombre_estado,
                cn.nombre_cnorma AS tipo_norma
            FROM normatividad n
            LEFT JOIN categoria c ON n.id_categoria = c.id_categoria
            LEFT JOIN estado e ON n.id_estado = e.id_estado
            LEFT JOIN categoria_norma cn ON n.id_Cnorma = cn.id_Cnorma
            ORDER BY n.fecha_emicion DESC
        `);

            return rows;
        } catch (error) {
            throw new Error('Error al filtrar normas por tipo de vehículo: ' + error.message);
        }
    }

    // =============================
    // 🔹 CONSEJOS
    // =============================
    async listarConsejos() {
        try {
            const [rows] = await db.execute(`
            SELECT 
                c.id_consejo,
                c.numero_consejo,
                c.titulo_consejo,
                c.descripcion,
                c.fecha_creacion,
                cat.nombre_categoria,
                e.nombre_estado,
                n.titulo_norma
            FROM consejo c
            LEFT JOIN categoria cat ON c.id_categoria = cat.id_categoria
            LEFT JOIN estado e ON c.id_estado = e.id_estado
            LEFT JOIN normatividad n ON c.id_norma = n.id_norma
            ORDER BY c.fecha_creacion DESC
        `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async crearConsejo(data) {
        try {
            const { numero_consejo, titulo_consejo, descripcion, id_categoria, id_estado, id_norma } = data;
            const fecha_creacion = new Date();

            // Validar campos mínimos
            if (!numero_consejo || !titulo_consejo || !descripcion) {
                throw new Error("Faltan campos obligatorios para crear el consejo");
            }

            const [result] = await db.execute(
                `INSERT INTO consejo (numero_consejo, titulo_consejo, descripcion, id_categoria, id_estado, fecha_creacion, id_norma)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [numero_consejo, titulo_consejo, descripcion, id_categoria, id_estado, fecha_creacion, id_norma]
            );

            return {
                id_consejo: result.insertId,
                numero_consejo,
                titulo_consejo,
                descripcion
            };
        } catch (error) {
            throw error;
        }
    }


    // =============================
    // 🔹 CONSULTA DE LEYES (NORMATIVIDAD)
    // =============================
    async listarNormatividad() {
        try {
            const [rows] = await db.execute(`
            SELECT 
                n.*, 
                c.nombre_categoria, 
                e.nombre_estado, 
                t.nombre_cnorma AS tipo_norma
            FROM normatividad n
            LEFT JOIN categoria c ON n.id_categoria = c.id_categoria
            LEFT JOIN estado e ON n.id_estado = e.id_estado
            LEFT JOIN categoria_norma t ON n.id_Cnorma = t.id_Cnorma
        `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async buscarNorma(numero_norma, titulo_norma) {
        try {
            let query = `SELECT * FROM normatividad WHERE 1=1`;
            const params = [];

            if (numero_norma) {
                query += " AND numero_norma = ?";
                params.push(numero_norma);
            }

            if (titulo_norma) {
                query += " AND titulo_norma LIKE ?";
                params.push(`%${titulo_norma}%`);
            }

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // =============================
    // 🔹 NOTICIAS
    // =============================
    async listarNoticias() {
        try {
            const [rows] = await db.execute(`
            SELECT 
                n.*, 
                u.nombre_usuario, 
                e.nombre_estado 
            FROM noticia n
            INNER JOIN usuarios u ON n.id_usuarios = u.id_usuarios
            LEFT JOIN estado e ON n.id_estado = e.id_estado
            ORDER BY fecha_publicacion DESC
        `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async crearNoticia(data, id_usuario) {
        try {
            const { titulo_noticia, resumen, fuente, id_estado } = data;
            const fecha_publicacion = new Date();

            const [result] = await db.execute(
                `INSERT INTO noticia (titulo_noticia, resumen, fecha_publicacion, fuente, id_estado, id_usuarios) 
             VALUES (?, ?, ?, ?, ?, ?)`,
                [titulo_noticia, resumen, fecha_publicacion, fuente, id_estado, id_usuario]
            );

            return { id_noticia: result.insertId, titulo_noticia, resumen, fuente };
        } catch (error) {
            throw error;
        }
    }

    // =============================
    // 🔹 PREGUNTAS FRECUENTES
    // =============================
    async listarPreguntas() {
        try {
            const [rows] = await db.execute(`
            SELECT 
                p.*, 
                c.nombre_categoria, 
                u.nombre_usuario
            FROM preguntas p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            INNER JOIN usuarios u ON p.id_usuario = u.id_usuarios
        `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async crearPregunta(data, id_usuario) {
        try {
            const { titulo_pregunta, id_categoria, respuesta } = data;

            const [result] = await db.execute(
                `INSERT INTO preguntas (titulo_pregunta, id_categoria, respuesta, id_usuario) 
             VALUES (?, ?, ?, ?)`,
                [titulo_pregunta, id_categoria, respuesta, id_usuario]
            );

            return { id_pregunta: result.insertId, titulo_pregunta, respuesta };
        } catch (error) {
            throw error;
        }
    }


    // =============================
    // 🔹 CRUD DE USUARIOS
    // =============================
    async listarUsuarios() {
        try {
            const [rows] = await db.execute(
                `SELECT 
                u.id_usuarios, 
                u.nombre_usuario, 
                u.correo,          
                u.id_rol, 
                r.nombre_rol, 
                u.estado, 
                u.fecha_creacion
             FROM usuarios u
             INNER JOIN rol r ON u.id_rol = r.id_rol
             ORDER BY u.id_usuarios ASC`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }


    async obtenerUsuario(id) {
        try {
            const [rows] = await db.execute(
                `SELECT u.id_usuarios, u.nombre_usuario, u.correo, u.id_rol, r.nombre_rol, u.estado, u.fecha_creacion
                 FROM usuarios u
                 INNER JOIN rol r ON u.id_rol = r.id_rol
                 WHERE u.id_usuarios = ?`,
                [id]
            );

            if (rows.length === 0) throw new Error('Usuario no encontrado');
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    async actualizarUsuario(id, data) {
        try {
            const campos = [];
            const valores = [];

            // Validar si se intenta cambiar el correo
            if (data.correo) {
                const [correoExistente] = await db.execute(
                    'SELECT id_usuarios FROM usuarios WHERE correo = ? AND id_usuarios <> ?',
                    [data.correo, id]
                );

                if (correoExistente.length > 0) {
                    throw new Error('El correo electrónico ya está en uso por otro usuario');
                }

                campos.push('correo = ?');
                valores.push(data.correo);
            }

            // Actualizar nombre de usuario
            if (data.nombre_usuario) {
                campos.push('nombre_usuario = ?');
                valores.push(data.nombre_usuario);
            }

            // Actualizar rol
            if (data.id_rol) {
                campos.push('id_rol = ?');
                valores.push(data.id_rol);
            }

            // Actualizar estado
            if (data.estado !== undefined) {
                campos.push('estado = ?');
                valores.push(data.estado);
            }

            if (campos.length === 0) {
                throw new Error('No se enviaron campos para actualizar');
            }

            valores.push(id);

            const [result] = await db.execute(
                `UPDATE usuarios SET ${campos.join(', ')} WHERE id_usuarios = ?`,
                valores
            );

            if (result.affectedRows === 0) {
                throw new Error('Usuario no encontrado o sin cambios');
            }

            const [usuario] = await db.execute(
                'SELECT * FROM usuarios WHERE id_usuarios = ?',
                [id]
            );
            return usuario[0];
        } catch (error) {
            throw error;
        }
    }

    async eliminarUsuario(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM usuarios WHERE id_usuarios = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Usuario no encontrado');
            }

            return { mensaje: 'Usuario eliminado correctamente' };
        } catch (error) {
            throw error;
        }
    }
}

export default new AuthService();