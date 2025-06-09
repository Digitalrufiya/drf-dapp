// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const SECRET_KEY = 'your_super_secret_key'; // Replace with env var in production

// TEMP: Hardcoded admin user (store in DB later)
const adminUser = {
  email: 'digitalrufiya@gmail.com',
  password: 'Zivian91000@2020',
  role: 'admin'
};

// POST /api/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === adminUser.email && password === adminUser.password) {
    const token = jwt.sign({ email: adminUser.email, role: adminUser.role }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
