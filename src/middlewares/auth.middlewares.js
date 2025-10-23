import jwt from 'jsonwebtoken';
import jwtConfig from '../utilities/jwt.config.js';

/**
 * Middleware para verificar el token JWT
 */
const verificarToken = (req, res, next) => {
    try {
        // El token normalmente viene en el encabezado: Authorization: Bearer <token>
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(403).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1]; // Extrae el token después de "Bearer"

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        // Verificar el token
        jwt.verify(token, jwtConfig.secret, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            // Guardar la información del usuario en la solicitud
            req.usuario = decoded;
            next();
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar token: ' + error.message
        });
    }
};

/**
 * Middleware adicional para verificar si el usuario es administrador
 */
const verificarAdmin = (req, res, next) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si el rol del usuario es de administrador (id_rol = 1)
        if (req.usuario.id_rol !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: se requiere rol de administrador'
            });
        }

        next(); // El usuario es admin, puede continuar
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar rol: ' + error.message
        });
    }
};

export { verificarToken, verificarAdmin };
