// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Basic API key for security — keep this secret, store in env variables in production
const API_KEY = 'YOUR_SECRET_API_KEY_HERE';

app.use(cors()); // Allow frontend from any origin (adjust for production!)
app.use(express.json()); // Parse JSON body

// Middleware to check API key
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
});

// Example POST endpoint to receive wallet data and save (you can customize)
app.post('/api/save-wallet', (req, res) => {
  const { userId, walletAddress } = req.body;

  if (typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }
  if (typeof walletAddress !== 'string' || !walletAddress.trim()) {
    return res.status(400).json({ error: 'Invalid or missing walletAddress' });
  }

  // TODO: Save to your database here or file system
  // For demo, just respond with success
  console.log(`Saving wallet for user ${userId}: ${walletAddress}`);

  res.json({ success: true, message: 'Wallet saved successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
