import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'conduce_legal',
    port: process.env.DB_PORT || 3306
};

function migrateDatabase() {
    console.log('?? Iniciando migración de base de datos...');

    const connection = mysql.createConnection(config);

    connection.connect((err) => {
        if (err) {
            console.error('? Error conectando a MySQL:', err.message);
            return;
        }

        console.log('? Conectado a MySQL');

        const migrationSQL = `
            -- 1. Agregar columna correo si no existe
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS correo VARCHAR(150) UNIQUE AFTER nombre_usuario;

            -- 2. Actualizar correo del admin si está vacío
            UPDATE usuarios 
            SET correo = 'admin@conducelegal.com' 
            WHERE nombre_usuario = 'admin' AND correo IS NULL;

            -- 3. Crear índice único para correo
            CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_correo ON usuarios(correo);

            -- 4. AGREGAR NUEVOS ROLES (SPRINT 3)
            -- Primero verificar si la tabla roles existe, si no crearla
            CREATE TABLE IF NOT EXISTS roles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(50) UNIQUE NOT NULL,
                descripcion VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 5. Insertar los 4 roles requeridos
            INSERT IGNORE INTO roles (id, nombre, descripcion) VALUES
            (1, 'admin', 'Administrador del sistema'),
            (2, 'conductor', 'Conductor de vehículos'),
            (3, 'analista', 'Analista de datos'),
            (4, 'consultor_legal', 'Consultor legal');

            -- 6. Verificar si existe columna rol_id en usuarios, si no agregarla
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS rol_id INT AFTER correo;

            -- 7. Agregar foreign key si no existe
            ALTER TABLE usuarios 
            ADD CONSTRAINT IF NOT EXISTS fk_usuario_rol 
            FOREIGN KEY (rol_id) REFERENCES roles(id);

            -- 8. Asegurar que el campo estado existe con valores correctos
           ALTER TABLE usuarios 
           ADD COLUMN IF NOT EXISTS estado TINYINT DEFAULT 0 AFTER fecha_creacion;
    
           -- 9. Agregar comentario para documentación
           ALTER TABLE usuarios 
           MODIFY COLUMN estado TINYINT DEFAULT 0 COMMENT '0=inactivo, 1=activo';
        `;

        connection.query(migrationSQL, (err, results) => {
            if (err) {
                console.error('Error en migración:', err.message);
            } else {
                console.log('✅ Migración completada exitosamente');
                console.log('📊 Roles agregados: admin, conductor, analista, consultor_legal');

                // Verificar la estructura de roles
                connection.query('SELECT * FROM roles', (err, results) => {
                    if (err) {
                        console.error('? Error verificando roles:', err.message);
                    } else {
                        console.log('\n?? Roles en la base de datos:');
                        results.forEach(rol => {
                            console.log(`   ${rol.id} - ${rol.nombre} - ${rol.descripcion}`);
                        });
                    }
                    connection.end();
                });
            }
        });
    });
}

migrateDatabase();