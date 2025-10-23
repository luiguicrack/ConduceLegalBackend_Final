import express from 'express';
import authService from '../services/auth.service.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middlewares.js';


const router = express.Router();

/* ================================
   AUTENTICACIÓN
================================ */

// HU0018: Registro de usuario
router.post('/registro', async (req, res) => {
    try {
        const { nombre_usuario, contraseña, id_rol = 2 } = req.body;

        if (!nombre_usuario || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de usuario y contraseña son requeridos'
            });
        }

        const nuevoUsuario = await authService.registrarUsuario({
            nombre_usuario,
            contraseña,
            id_rol
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: nuevoUsuario
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al registrar usuario'
        });
    }
});

// HU0019: Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { nombre_usuario, contraseña } = req.body;

        if (!nombre_usuario || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de usuario y contraseña son requeridos'
            });
        }

        const loginData = await authService.loginUsuario({ nombre_usuario, contraseña });

        res.json({
            success: true,
            message: 'Login exitoso',
            data: loginData
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Credenciales inválidas'
        });
    }
});

// HU0020: Logout de usuario
router.post('/logout', verificarToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Sesión cerrada correctamente. Elimine el token en el cliente.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al cerrar sesión'
        });
    }
});

/**
 * @swagger
 * /api/auth/recuperar:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un correo electrónico con un enlace único para restablecer la contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 example: "usuario@email.com"
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *       404:
 *         description: No se encontró un usuario con ese correo
 */
router.post("/recuperar", async (req, res) => {
    try {
        const { correo } = req.body;
        const result = await authService.solicitarRecuperacion(correo);
        res.json({ success: true, message: result.mensaje });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/auth/restablecer:
 *   post:
 *     summary: Restablecer contraseña con token
 *     description: Permite cambiar la contraseña usando el token recibido por correo.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "b6e78acb9d1234abcd567f890"
 *               nuevaContraseña:
 *                 type: string
 *                 example: "MiNuevaClaveSegura123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post("/restablecer", async (req, res) => {
    try {
        const { token, nuevaContraseña } = req.body;
        const result = await authService.restablecerContraseña(token, nuevaContraseña);
        res.json({ success: true, message: result.mensaje });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Ruta temporal para probar enlace de recuperación desde el navegador
router.get("/restablecer/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const db = await import('../config/database.config.js');

        const [usuarios] = await db.default.execute(
            "SELECT * FROM usuarios WHERE token_recuperacion = ? AND token_expira > NOW()",
            [token]
        );

        // --- Caso 1: Token inválido o expirado ---
        if (usuarios.length === 0) {
            return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Enlace expirado</title>
        <style>
          body {
            background: linear-gradient(135deg, #f6d365, #fda085);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: white;
            padding: 2.5rem 3rem;
            border-radius: 16px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 420px;
          }
          h2 {
            color: #d9534f;
            font-size: 1.6rem;
            margin-bottom: 0.5rem;
          }
          p {
            color: #555;
            margin-bottom: 1rem;
            font-size: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>❌ Enlace inválido o expirado</h2>
          <p>Tu enlace para restablecer la contraseña ha caducado o no es válido.</p>
          <p>Por favor, solicita nuevamente la recuperación de contraseña.</p>
        </div>
      </body>
      </html>
      `);
        }

        // --- Caso 2: Token válido ---
        res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Restablecer contraseña</title>
      <style>
        body {
          background: linear-gradient(135deg, #89f7fe, #66a6ff);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background: white;
          padding: 2.5rem 3rem;
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          text-align: center;
          max-width: 420px;
        }
        h2 {
          color: #198754;
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
        }
        p {
          color: #444;
          font-size: 1rem;
          margin-bottom: 1.2rem;
        }
        .token-box {
          background: #f1f3f5;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #333;
          word-break: break-all;
          margin-bottom: 1.5rem;
          border: 1px solid #dee2e6;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        input {
          padding: 0.8rem;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          width: 100%;
        }
        button {
          background: #198754;
          color: white;
          border: none;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #157347;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔒 Restablece tu contraseña</h2>
        <p>Tu enlace es válido. Usa el siguiente token para confirmar el cambio:</p>
        <div class="token-box">${token}</div>
        <form id="resetForm">
          <input type="password" id="newPassword" placeholder="Nueva contraseña" required />
          <button type="submit">Actualizar contraseña</button>
        </form>
      </div>

      <script>
        const form = document.getElementById('resetForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const nuevaContraseña = document.getElementById('newPassword').value.trim();
          if (!nuevaContraseña) return alert('Por favor ingresa una contraseña.');

          const res = await fetch('/api/auth/restablecer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: '${token}', nuevaContraseña })
          });

          if (res.ok) {
            alert('✅ Tu contraseña se ha actualizado correctamente.');
            window.location.href = '/login';
          } else {
            alert('❌ Error al actualizar la contraseña. Intenta nuevamente.');
          }
        });
      </script>
    </body>
    </html>
    `);

    } catch (error) {
        res.status(500).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Error interno</title>
      <style>
        body {
          background: #f8d7da;
          font-family: sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .error-box {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
        }
        h3 {
          color: #842029;
        }
        pre {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          text-align: left;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="error-box">
        <h3>Error interno del servidor</h3>
        <pre>${error.message}</pre>
      </div>
    </body>
    </html>
    `);
    }
});

/* ================================
   NUEVAS FUNCIONALIDADES
================================ */

// 🔹 Buscar en todas las secciones (leyes, noticias, consejos, preguntas)
router.get('/buscar', async (req, res) => {
    try {
        const { palabra } = req.query;

        if (!palabra) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una palabra de búsqueda'
            });
        }

        const resultados = await authService.buscarPorPalabraClave(palabra);
        res.json({ success: true, data: resultados });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error en la búsqueda general'
        });
    }
});

// 🔹 Filtrar normatividad por tipo de vehículo (moto o carro)
router.get('/normas/vehiculo/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;

        const resultados = await authService.filtrarPorVehiculo(tipo);
        res.json({ success: true, data: resultados });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al filtrar normatividad por vehículo'
        });
    }
});

/* ================================
   CONSEJOS
================================ */
router.get('/consejos', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, titulo: 'Usa cinturón de seguridad', descripcion: 'Siempre usa el cinturón de seguridad.' },
            { id: 2, titulo: 'No uses el celular', descripcion: 'Evita distracciones al conducir.' }
        ]
    });
});

router.post('/consejos', verificarToken, (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Consejo creado correctamente',
        data: req.body
    });
});

/* ================================
   LEYES
================================ */
router.get('/leyes', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, articulo: 'Ley 769 de 2002', descripcion: 'Código Nacional de Tránsito en Colombia.' },
            { id: 2, articulo: 'Ley 1383 de 2010', descripcion: 'Modifica el Código Nacional de Tránsito.' }
        ]
    });
});

router.post('/leyes', verificarToken, (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Ley registrada correctamente',
        data: req.body
    });
});

/* ================================
   NOTICIAS
================================ */
router.get('/noticias', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, titulo: 'Nueva regulación de tránsito', fecha: '2025-09-30' },
            { id: 2, titulo: 'Campaña de seguridad vial', fecha: '2025-09-28' }
        ]
    });
});

router.post('/noticias', verificarToken, (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Noticia creada correctamente',
        data: req.body
    });
});

/* ================================
   PREGUNTAS
================================ */
router.get('/preguntas', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, pregunta: '¿Cuál es el límite de velocidad en zona escolar?', respuesta: '30 km/h' },
            { id: 2, pregunta: '¿Qué significa la luz amarilla del semáforo?', respuesta: 'Precaución, prepare para detenerse.' }
        ]
    });
});

router.post('/preguntas', verificarToken, (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Pregunta registrada correctamente',
        data: req.body
    });
});

/* ================================
   CRUD DE USUARIOS
================================ */

// Obtener todos los usuarios (solo ADMIN)
router.get('/usuarios', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await authService.listarUsuarios();
        res.json({ success: true, data: usuarios });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al listar usuarios'
        });
    }
});

// Obtener usuario por ID (solo ADMIN)
router.get('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuario = await authService.obtenerUsuario(req.params.id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, data: usuario });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener usuario'
        });
    }
});

// Crear nuevo usuario (solo ADMIN)
router.post('/usuarios', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { nombre_usuario, contraseña, id_rol } = req.body;
        if (!nombre_usuario || !contraseña) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
        }
        const nuevoUsuario = await authService.registrarUsuario({ nombre_usuario, contraseña, id_rol });
        res.status(201).json({ success: true, message: 'Usuario creado correctamente', data: nuevoUsuario });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Actualizar usuario (solo ADMIN)
router.put('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarioActualizado = await authService.actualizarUsuario(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: usuarioActualizado
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar usuario'
        });
    }
});

// Eliminar usuario (solo ADMIN)
router.delete('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const resultado = await authService.eliminarUsuario(req.params.id);
        res.json({ success: true, message: resultado.mensaje });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Error al eliminar usuario'
        });
    }
});

export default router;