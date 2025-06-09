// drfrobo-server.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { create } from 'ipfs-http-client';

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_super_secret_jwt_key';
const IPFS_API = 'http://localhost:5001'; // make sure your IPFS node is running

const ipfs = create(IPFS_API);
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const users = [{ id: 'admin', email: 'admin@drfrobo.com', password: '123456' }];

// JWT Auth Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Upload file endpoint
app.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const { cid } = await ipfs.add(fileBuffer);
    res.json({ cid: cid.toString() });
  } catch (e) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get file (stream from IPFS)
app.get('/file/:cid', async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(req.params.cid)) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    res.send(fileBuffer);
  } catch (e) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => console.log(`🚀 DRF Robo Backend running at http://localhost:${PORT}`));
