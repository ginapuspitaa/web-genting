import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const addPasswordColumn = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'web_genting_db'
    });

    console.log("Menambahkan kolom password ke tabel users...");
    
    // Cek apakah kolom sudah ada
    const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'password'`);
    if (columns.length === 0) {
      // Tambahkan kolom password varchar dengan default password hash '123456' untuk sementara (meski tanpa bcrypt)
      await connection.query(`ALTER TABLE users ADD COLUMN password VARCHAR(255) DEFAULT '123456'`);
      console.log("Kolom password berhasil ditambahkan! Password default admin dan user lama adalah '123456'");
    } else {
      console.log("Kolom password sudah ada.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Gagal mengubah tabel users:", error);
    process.exit(1);
  }
};

addPasswordColumn();
