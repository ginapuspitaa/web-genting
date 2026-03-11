import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await pool.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'petugas') DEFAULT 'petugas'");
    console.log("Ditambahkan kolom 'role' ke tabel users.");
    
    await pool.query("UPDATE users SET role = 'admin' WHERE email = 'admin@webgenting.com' OR id = 1");
    console.log("Role admin berhasil disetel untuk akun utama.");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Kolom 'role' sudah ada, melewati setelan...");
      await pool.query("UPDATE users SET role = 'admin' WHERE email = 'admin@webgenting.com' OR id = 1");
      process.exit(0);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
};

run();
