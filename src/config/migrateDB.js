import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
};

async function dropExistingForeignKeys(connection, schema, table, constraintNames) {
    for (const fk of constraintNames) {
        try {
            await connection.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?;
      `, [schema, table, fk]);
            await connection.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk}\`;`);
            console.log(`🧹 Eliminada foreign key duplicada: ${fk}`);
        } catch {
            // No pasa nada si no existe
        }
    }
}

async function migrateDB() {
    const connection = await mysql.createConnection(config);
    const schema = process.env.DB_NAME || "conduce_legal";

    try {
        console.log("🚀 Iniciando migración completa de la base de datos...");

        // 1️⃣ Crear base
        await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${schema}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
    `);
        await connection.query(`USE \`${schema}\`;`);
        console.log(`✅ Base de datos '${schema}' lista`);

        // 2️⃣ Tablas
        const tablesSQL = `
    CREATE TABLE IF NOT EXISTS categoria (
      id_categoria INT AUTO_INCREMENT PRIMARY KEY,
      nombre_categoria VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS categoria_norma (
      id_Cnorma INT AUTO_INCREMENT PRIMARY KEY,
      nombre_cnorma VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS estado (
      id_estado INT AUTO_INCREMENT PRIMARY KEY,
      nombre_estado VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS rol (
      id_rol INT AUTO_INCREMENT PRIMARY KEY,
      nombre_rol VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      descripcion VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
      nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
      contraseña VARCHAR(255) NOT NULL,
      id_rol INT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      correo VARCHAR(50) UNIQUE,
      rol_id INT DEFAULT NULL,
      estado TINYINT DEFAULT 0,
      token_recuperacion VARCHAR(255) DEFAULT NULL,
      token_expira DATETIME DEFAULT NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS normatividad (
      id_norma INT AUTO_INCREMENT PRIMARY KEY,
      numero_norma INT NOT NULL,
      titulo_norma VARCHAR(255) NOT NULL,
      id_categoria INT NOT NULL,
      id_estado INT NOT NULL,
      descripcion TEXT,
      fuente VARCHAR(200),
      fecha_emicion DATE NOT NULL,
      id_Cnorma INT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS consejo (
      id_consejo INT AUTO_INCREMENT PRIMARY KEY,
      numero_consejo INT NOT NULL,
      titulo_consejo VARCHAR(255) NOT NULL,
      id_categoria INT NOT NULL,
      id_estado INT NOT NULL,
      descripcion TEXT NOT NULL,
      fecha_creacion DATETIME NOT NULL,
      id_norma INT DEFAULT NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS noticia (
      id_noticia INT AUTO_INCREMENT PRIMARY KEY,
      titulo_noticia VARCHAR(255) NOT NULL,
      contenido_noticia TEXT,
      fecha_publicacion DATE NOT NULL,
      fuente VARCHAR(200),
      id_estado INT NOT NULL,
      id_usuarios INT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS preguntas (
      id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
      titulo_pregunta VARCHAR(255) NOT NULL,
      id_categoria INT NOT NULL,
      respuesta TEXT NOT NULL,
      id_usuario INT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    `;

        await connection.query(tablesSQL);
        console.log("✅ Tablas creadas correctamente");

        // 3️⃣ Datos base
        await connection.query(`
      INSERT IGNORE INTO roles (id, nombre, descripcion) VALUES
      (1, 'admin', 'Administrador del sistema'),
      (2, 'conductor', 'Conductor de vehículos'),
      (3, 'analista', 'Analista de datos'),
      (4, 'consultor_legal', 'Consultor legal');

      INSERT IGNORE INTO categoria (id_categoria, nombre_categoria) VALUES
      (1, 'Seguridad Vial'),
      (2, 'Normas de Tránsito'),
      (3, 'Licencias de Conducción'),
      (4, 'Sanciones y Multas'),
      (5, 'Señales de Tránsito');

      INSERT IGNORE INTO categoria_norma (id_Cnorma, nombre_cnorma) VALUES
      (1, 'Ley'),
      (2, 'Decreto'),
      (3, 'Resolución'),
      (4, 'Acuerdo'),
      (5, 'Circular');

      INSERT IGNORE INTO estado (id_estado, nombre_estado) VALUES
      (1, 'Activo'),
      (2, 'Inactivo'),
      (3, 'Pendiente'),
      (4, 'Publicado'),
      (5, 'Borrador');

      INSERT IGNORE INTO rol (id_rol, nombre_rol) VALUES
      (1, 'admin'),
      (2, 'conductor'),
      (3, 'analista'),
      (4, 'consultor_legal');
    `);
        console.log("✅ Datos base insertados");

        // 4️⃣ Eliminar claves duplicadas antes de volver a crear
        await dropExistingForeignKeys(connection, schema, "usuarios", ["fk_usuarios_rol"]);
        await dropExistingForeignKeys(connection, schema, "consejo", ["fk_consejo_categoria", "fk_consejo_estado", "fk_consejo_norma"]);
        await dropExistingForeignKeys(connection, schema, "normatividad", ["fk_normatividad_categoria", "fk_normatividad_cnorma", "fk_normatividad_estado"]);
        await dropExistingForeignKeys(connection, schema, "noticia", ["fk_noticia_estado", "fk_noticia_usuarios"]);
        await dropExistingForeignKeys(connection, schema, "preguntas", ["fk_preguntas_categoria", "fk_preguntas_usuarios"]);

        // 5️⃣ Crear relaciones nuevamente
        const relationsSQL = `
      ALTER TABLE usuarios
        ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol);

      ALTER TABLE consejo
        ADD CONSTRAINT fk_consejo_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
        ADD CONSTRAINT fk_consejo_estado FOREIGN KEY (id_estado) REFERENCES estado (id_estado),
        ADD CONSTRAINT fk_consejo_norma FOREIGN KEY (id_norma) REFERENCES normatividad (id_norma);

      ALTER TABLE normatividad
        ADD CONSTRAINT fk_normatividad_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
        ADD CONSTRAINT fk_normatividad_cnorma FOREIGN KEY (id_Cnorma) REFERENCES categoria_norma (id_Cnorma),
        ADD CONSTRAINT fk_normatividad_estado FOREIGN KEY (id_estado) REFERENCES estado (id_estado);

      ALTER TABLE noticia
        ADD CONSTRAINT fk_noticia_estado FOREIGN KEY (id_estado) REFERENCES estado (id_estado),
        ADD CONSTRAINT fk_noticia_usuarios FOREIGN KEY (id_usuarios) REFERENCES usuarios (id_usuarios);

      ALTER TABLE preguntas
        ADD CONSTRAINT fk_preguntas_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
        ADD CONSTRAINT fk_preguntas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuarios);
    `;
        await connection.query(relationsSQL);
        console.log("🔗 Relaciones aplicadas correctamente");

        console.log("🎉 Migración completa sin errores ✅");
    } catch (err) {
        console.error("❌ Error en la migración:", err.message);
    } finally {
        await connection.end();
    }
}

migrateDB();