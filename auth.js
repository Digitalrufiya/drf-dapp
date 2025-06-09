// auth.js
import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

const ADMIN_EMAIL = 'digitalrufiya@gmail.com';
const ADMIN_PASSWORD = 'Zivian91000@2020';
const SECRET_KEY = 'your_jwt_secret_key'; // Change this and keep it safe

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Middleware to protect routes
export function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    req.user = decoded;
    next();
  });
}

export default router;
