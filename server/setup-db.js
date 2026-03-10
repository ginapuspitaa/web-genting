import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import 'dotenv/config'; // Pastikan jalan di node versi lama

const setupDatabase = async () => {
  try {
    // 1. Konek ke MySQL tanpa spesifikasi database (untuk bikin DB-nya jika belum ada)
    console.log("Menghubungkan ke MySQL server...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'web_genting_db';

    // 2. Buat database jika belum ada
    console.log(`Membuat database '${dbName}' jika belum ada...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

    // 3. Gunakan database tsb
    await connection.query(`USE \`${dbName}\`;`);

    // 4. Buat tabel users
    console.log("Membuat tabel 'users'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Buat tabel categories
    console.log("Membuat tabel 'categories'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Buat tabel documents yang terhubung ke categories
    console.log("Membuat tabel 'documents' (terkait kategori)...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        petugas VARCHAR(255),
        upload_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // 5. Cek apakah tabel sudah ada datanya
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log("Memasukkan data dummy ke tabel users...");
      // Insert dummy data
      await connection.query(`
        INSERT INTO users (name, email) VALUES 
        ('Admin Utama', 'admin@webgenting.com'),
        ('Joko Susilo', 'joko@example.com'),
        ('Budi Santoso', 'budi@example.com'),
        ('Siti Aminah', 'siti@example.com')
      `);
      console.log("Data dummy berhasil ditambahkan!");
    } else {
      console.log("Tabel 'users' sudah berisi data, skip insert data dummy.");
    }

    // Masukkan beberapa kategori contoh jika tabel categories kosong
    const [catRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (catRows[0].count === 0) {
      console.log("Menambahkan kategori contoh ke tabel 'categories'...");
      await connection.query(`
        INSERT INTO categories (name, description) VALUES
        ('Umum', 'Kategori Umum untuk berbagai dokumen'),
        ('Keuangan', 'Dokumen terkait keuangan'),
        ('Teknis', 'Dokumen teknis dan panduan')
      `);
      console.log("Kategori contoh berhasil ditambahkan.");
    } else {
      console.log("Tabel 'categories' sudah berisi data, skip insert kategori contoh.");
    }

    // (Opsional) Masukkan contoh dokumen jika belum ada
    const [docRows] = await connection.query('SELECT COUNT(*) as count FROM documents');
    if (docRows[0].count === 0) {
      console.log("Menambahkan dokumen contoh ke tabel 'documents'...");
      // Ambil salah satu kategori untuk digunakan sebagai contoh
      const [cats] = await connection.query('SELECT id FROM categories LIMIT 1');
      const catId = cats[0] ? cats[0].id : null;
      await connection.query(`
        INSERT INTO documents (name, description, category_id, petugas, upload_date) VALUES
        ('Contoh Dokumen A', 'Deskripsi dokumen A', ?, 'Admin', CURDATE()),
        ('Contoh Dokumen B', 'Deskripsi dokumen B', ?, 'Admin', CURDATE())
      `, [catId, catId]);
      console.log("Dokumen contoh berhasil ditambahkan.");
    } else {
      console.log("Tabel 'documents' sudah berisi data, skip insert dokumen contoh.");
    }

    console.log("✅ Setup database berhasil!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat setup database:", error);
    process.exit(1);
  }
};

setupDatabase();
