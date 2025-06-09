// server.js

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import { Web3Storage, File } from 'web3.storage';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;

const web3Client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const users = [
  {
    id: 'admin1',
    email: 'digitalrufiya@gmail.com',
    password: 'Zivian91000@2020',
    role: 'admin',
  },
];

const posts = [];

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
}

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

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken(user);
  res.json({ token, email: user.email, role: user.role });
});

app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const file = new File([req.file.buffer], req.file.originalname);
    const cid = await web3Client.put([file]);

    res.json({ cid, fileName: req.file.originalname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

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

app.get('/api/timeline', authenticateToken, (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const start = (page - 1) * limit;
  const paginatedPosts = posts.slice(start, start + limit);

  res.json({ posts: paginatedPosts, page, limit, total: posts.length });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
