// server.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import crypto from 'crypto';
import { create } from 'ipfs-http-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || 'your_signed_url_secret';
const IPFS_API_URL = process.env.IPFS_API_URL || 'http://localhost:5001'; // your IPFS node API

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment variables!');
  process.exit(1);
}

const ipfs = create(IPFS_API_URL);

app.use(cors());
app.use(express.json());

// Multer config for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// In-memory user store
const users = [
  {
    id: 'admin1',
    email: 'digitalrufiya@gmail.com',
    password: 'Zivian91000@2020',
    role: 'admin',
    walletAddress: '',
  },
];

// In-memory file metadata store
// Structure: { cid: { versions: [{cid, metadata, timestamp}], pinned: boolean } }
const fileStore = {};

// --- JWT token generation ---
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// --- JWT middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// --- Login endpoint ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken(user);
  res.json({ token, email: user.email, role: user.role });
});

// --- Upload endpoint ---
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Optional metadata JSON sent in form field 'metadata'
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    // Upload buffer to IPFS
    const { cid } = await ipfs.add(req.file.buffer);

    // Store file metadata + versioning
    if (!fileStore[cid.toString()]) {
      fileStore[cid.toString()] = { versions: [], pinned: false };
    }
    fileStore[cid.toString()].versions.push({
      cid: cid.toString(),
      metadata,
      uploader: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      cid: cid.toString(),
      message: 'File uploaded to IPFS',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// --- Get file metadata + versions ---
app.get('/api/files/:cid', authenticateToken, (req, res) => {
  const cid = req.params.cid;
  if (!fileStore[cid]) return res.status(404).json({ error: 'File not found' });

  res.json({
    cid,
    pinned: fileStore[cid].pinned,
    versions: fileStore[cid].versions,
  });
});

// --- Pin a file ---
app.post('/api/pin/:cid', authenticateToken, async (req, res) => {
  const cid = req.params.cid;
  if (!fileStore[cid]) return res.status(404).json({ error: 'File not found' });

  try {
    await ipfs.pin.add(cid);
    fileStore[cid].pinned = true;
    res.json({ message: `Pinned ${cid}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Pinning failed' });
  }
});

// --- Unpin a file ---
app.post('/api/unpin/:cid', authenticateToken, async (req, res) => {
  const cid = req.params.cid;
  if (!fileStore[cid]) return res.status(404).json({ error: 'File not found' });

  try {
    await ipfs.pin.rm(cid);
    fileStore[cid].pinned = false;
    res.json({ message: `Unpinned ${cid}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unpinning failed' });
  }
});

// --- Delete a file (unpin + remove from metadata) ---
app.delete('/api/delete/:cid', authenticateToken, async (req, res) => {
  const cid = req.params.cid;
  if (!fileStore[cid]) return res.status(404).json({ error: 'File not found' });

  try {
    await ipfs.pin.rm(cid);
    delete fileStore[cid];
    res.json({ message: `Deleted ${cid}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// --- Generate signed URL for access ---
app.post('/api/signed-url', authenticateToken, (req, res) => {
  const { cid, expiresInSeconds = 3600 } = req.body;

  if (!cid || !fileStore[cid]) return res.status(404).json({ error: 'File not found' });

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // Create HMAC signature: HMAC(secret, cid + expiresAt)
  const hmac = crypto.createHmac('sha256', SIGNED_URL_SECRET);
  hmac.update(cid + expiresAt);
  const signature = hmac.digest('hex');

  const signedUrl = `${req.protocol}://${req.get('host')}/api/access/${cid}?expires=${expiresAt}&sig=${signature}`;
  res.json({ signedUrl, expiresAt });
});

// --- Access a file via signed URL ---
app.get('/api/access/:cid', async (req, res) => {
  const { cid } = req.params;
  const { expires, sig } = req.query;

  if (!cid || !expires || !sig) {
    return res.status(400).send('Invalid signed URL');
  }

  const expiresNum = Number(expires);
  if (isNaN(expiresNum) || expiresNum < Math.floor(Date.now() / 1000)) {
    return res.status(403).send('URL expired');
  }

  // Verify signature
  const hmac = crypto.createHmac('sha256', SIGNED_URL_SECRET);
  hmac.update(cid + expiresNum);
  const expectedSig = hmac.digest('hex');

  if (sig !== expectedSig) return res.status(403).send('Invalid signature');

  try {
    // Fetch file from IPFS and pipe to response
    const stream = ipfs.cat(cid);
    res.setHeader('Content-Disposition', `attachment; filename="${cid}"`);

    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    res.status(404).send('File not found');
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 CDN API Server running at http://localhost:${PORT}`);
  console.log('Make sure your IPFS node is running at', IPFS_API_URL);
});
