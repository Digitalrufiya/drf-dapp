// server.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment variables!');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// In-memory user store (replace with DB later)
const users = [
  {
    id: 'admin1',
    email: 'digitalrufiya@gmail.com',
    password: 'Zivian91000@2020',
    role: 'admin',
    walletAddress: '',
  },
];

// Generate JWT token
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

// Public login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user)
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken(user);
  res.json({ token, email: user.email, role: user.role });
});

// JWT auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = user;
    next();
  });
}

// Protected route: save wallet
app.post('/api/save-wallet', authenticateToken, (req, res) => {
  const { walletAddress } = req.body;
  const userId = req.user.id;

  if (!walletAddress || typeof walletAddress !== 'string')
    return res.status(400).json({ error: 'Invalid walletAddress' });

  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.walletAddress = walletAddress.trim();
  console.log(`Updated wallet for ${user.email}: ${user.walletAddress}`);

  res.json({ success: true, message: 'Wallet saved successfully' });
});

app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});
