import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import archiver from 'archiver';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: 'ok', message: 'Database connection successful!' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// Example endpoint: Get all users (assuming a 'users' table exists)
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter!' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar' });

    const userRole = role === 'admin' ? 'admin' : 'petugas';

    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, userRole]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar untuk user lain' });

    const userRole = role === 'admin' ? 'admin' : 'petugas';

    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter!' });
      await pool.query('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?', [name, email, password, userRole, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, userRole, id]);
    }
    
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null]);
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [docs] = await pool.query('SELECT id FROM documents WHERE category_id = ? LIMIT 1', [id]);
    if (docs.length > 0) {
      return res.status(400).json({ error: 'Kategori tidak dapat dihapus karena masih digunakan oleh dokumen.' });
    }
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Documents endpoints
app.get('/api/documents', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, c.name as category_name FROM documents d LEFT JOIN categories c ON d.category_id = c.id ORDER BY d.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    const { name, description, category_id, petugas, upload_date } = req.body;
    let filePath = null;
    
    // Jika ada file yg diupload, simpan path-nya
    if (req.file) {
      filePath = '/uploads/' + req.file.filename;
    }

    if (!name) return res.status(400).json({ error: 'name is required' });

    // Optional: check category exists
    if (category_id) {
      const [cats] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (cats.length === 0) return res.status(400).json({ error: 'category_id not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO documents (name, description, category_id, petugas, upload_date, file_path) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, category_id || null, petugas || null, upload_date || null, filePath]
    );

    const [rows] = await pool.query('SELECT d.*, c.name as category_name FROM documents d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document
app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const [docs] = await pool.query('SELECT file_path, name FROM documents WHERE id = ?', [id]);
    if (docs.length === 0 || !docs[0].file_path) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const localFilePath = docs[0].file_path.startsWith('/') ? docs[0].file_path.substring(1) : docs[0].file_path;
    const absPath = path.resolve(localFilePath);
    
    // We use path.basename to extract the filename with extension
    res.download(absPath, path.basename(localFilePath));
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download all documents as ZIP
app.get('/api/documents/download-all', async (req, res) => {
  try {
    const [docs] = await pool.query('SELECT file_path, name FROM documents WHERE file_path IS NOT NULL');
    
    if (docs.length === 0) {
      return res.status(404).json({ error: 'Tidak ada file untuk didownload' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Semua_Dokumen.zip"');

    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    archive.on('error', function(err) {
      throw err;
    });

    archive.pipe(res);

    // Keep track of names to prevent duplicates
    const nameCount = {};

    for (const doc of docs) {
      const localFilePath = doc.file_path.startsWith('/') ? doc.file_path.substring(1) : doc.file_path;
      const absPath = path.resolve(localFilePath);
      
      try {
        await fs.access(absPath); // check if file exists
        const ext = path.extname(localFilePath);
        
        // Handle duplicate names
        let safeName = doc.name;
        if (nameCount[safeName]) {
          nameCount[safeName]++;
          safeName = `${safeName}_${nameCount[safeName]}`;
        } else {
          nameCount[safeName] = 1;
        }

        archive.file(absPath, { name: `${safeName}${ext}` });
      } catch (err) {
        console.error(`File missing during zip: ${absPath}`);
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error('Error creating zip:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update document
app.put('/api/documents/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, petugas, upload_date } = req.body;
    
    const [existing] = await pool.query('SELECT file_path FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let filePath = existing[0].file_path;

    if (req.file) {
      filePath = '/uploads/' + req.file.filename;
      
      if (existing[0].file_path) {
        try {
          const oldLocalReqPath = existing[0].file_path.startsWith('/') ? existing[0].file_path.substring(1) : existing[0].file_path;
          await fs.unlink(path.resolve(oldLocalReqPath));
        } catch (err) {
          console.error('Failed to delete old file:', err);
        }
      }
    }

    await pool.query(
      'UPDATE documents SET name=?, description=?, category_id=?, petugas=?, upload_date=?, file_path=? WHERE id=?',
      [name, description || null, category_id || null, petugas || null, upload_date || null, filePath, id]
    );

    const [rows] = await pool.query('SELECT d.*, c.name as category_name FROM documents d LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all documents
app.delete('/api/documents/all', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT file_path FROM documents WHERE file_path IS NOT NULL');
    
    // Delete physical files
    for (const doc of existing) {
      try {
        const localReqPath = doc.file_path.startsWith('/') ? doc.file_path.substring(1) : doc.file_path;
        await fs.unlink(path.resolve(localReqPath));
      } catch (err) {
        console.error('Failed to delete file during bulk delete:', err);
      }
    }

    // Delete db records
    await pool.query('DELETE FROM documents');
    res.json({ message: 'All documents deleted successfully' });
  } catch (error) {
    console.error('Error bulk deleting documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await pool.query('SELECT file_path FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (existing[0].file_path) {
      try {
        const oldLocalReqPath = existing[0].file_path.startsWith('/') ? existing[0].file_path.substring(1) : existing[0].file_path;
        await fs.unlink(path.resolve(oldLocalReqPath));
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    await pool.query('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // In a real app, you should use bcrypt to hash and compare passwords.
    // For this prototype, we are doing a plain text comparison.
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    
    if (users.length > 0) {
      const user = users[0];
      // Do not send the password back to the client
      delete user.password;
      res.json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ error: 'Email atau Password salah!' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter!' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar!' });
    }

    // Insert new user
    // Again, in a real app, hash the password using bcrypt before saving
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    res.status(201).json({ message: 'Akun berhasil dibuat', userId: result.insertId });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email dan password baru wajib diisi!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter!' });
    }

    // Check if email exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'Email tidak ditemukan di sistem!' });
    }

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [newPassword, email]
    );

    res.json({ message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Dashboard Statistics endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [categoryCount] = await pool.query('SELECT COUNT(*) as count FROM categories');
    const [documentCount] = await pool.query('SELECT COUNT(*) as count FROM documents');

    // For the chart, we might want documents count grouped by upload_date or category
    // Let's get document counts by category for a simple chart
    const [chartData] = await pool.query(`
      SELECT c.name, COUNT(d.id) as value 
      FROM categories c 
      LEFT JOIN documents d ON c.id = d.category_id 
      GROUP BY c.id, c.name
    `);

    res.json({
      users: userCount[0].count,
      categories: categoryCount[0].count,
      documents: documentCount[0].count,
      chartData: chartData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
