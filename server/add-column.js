import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const addFilePathColumn = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'web_genting_db'
    });

    console.log("Menambahkan kolom file_path ke tabel documents...");
    
    // Cek apakah kolom sudah ada
    const [columns] = await connection.query(`SHOW COLUMNS FROM documents LIKE 'file_path'`);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE documents ADD COLUMN file_path VARCHAR(255)`);
      console.log("Kolom file_path berhasil ditambahkan!");
    } else {
      console.log("Kolom file_path sudah ada.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Gagal mengubah tabel:", error);
    process.exit(1);
  }
};

addFilePathColumn();
