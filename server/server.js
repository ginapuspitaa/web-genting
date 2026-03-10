import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

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
