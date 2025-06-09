import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import { create } from 'ipfs-http-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const IPFS_API_URL = process.env.IPFS_API_URL || 'http://localhost:5001';

const ipfs = create(IPFS_API_URL);

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// In-memory user store (for demo)
const users = [
  {
    id: 'admin1',
    email: 'digitalrufiya@gmail.com',
    password: 'Zivian91000@2020',
    role: 'admin',
  },
];

// In-memory posts store: [{ id, userEmail, text, fileCid, timestamp }]
const posts = [];

// Generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
}

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken(user);
  res.json({ token, email: user.email, role: user.role });
});

// Upload file to IPFS
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    const { cid } = await ipfs.add(req.file.buffer);

    res.json({ cid: cid.toString(), metadata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Create a post (text + file CID)
app.post('/api/posts', authenticateToken, (req, res) => {
  const { text, cid } = req.body;
  if (!text && !cid) return res.status(400).json({ error: 'Post text or file CID required' });

  const post = {
    id: posts.length + 1,
    userEmail: req.user.email,
    text,
    fileCid: cid || null,
    timestamp: new Date().toISOString(),
  };
  posts.unshift(post);

  res.json({ message: 'Post created', post });
});

// Get timeline posts with pagination
app.get('/api/timeline', authenticateToken, (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedPosts = posts.slice(start, end);

  res.json({ posts: paginatedPosts, page, limit, total: posts.length });
});

app.listen(PORT, () => {
  console.log(`🚀 DRF Robo backend running on http://localhost:${PORT}`);
  console.log('Make sure IPFS node is running at', IPFS_API_URL);
});
