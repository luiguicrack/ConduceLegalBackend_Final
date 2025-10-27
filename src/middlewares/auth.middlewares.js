import jwt from 'jsonwebtoken';
import jwtConfig from '../utilities/jwt.config.js';

/**
 * Middleware para verificar el token JWT
 */
const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(403).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        jwt.verify(token, jwtConfig.secret, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

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
 * Middleware para verificar si el usuario tiene rol permitido
 * Roles permitidos: 1 (admin), 3 y 4
 * Rol denegado: 2 (usuario)
 */
const verificarAdmin = (req, res, next) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Roles permitidos
        const rolesPermitidos = [1, 3, 4];

        if (!rolesPermitidos.includes(req.usuario.id_rol)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: se requiere rol autorizado (1, 3 o 4)'
            });
        }

        next(); // El rol está permitido, puede continuar
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar rol: ' + error.message
        });
    }
};

export { verificarToken, verificarAdmin };
