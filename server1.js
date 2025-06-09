import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { uploadJSONtoIPFS } from './utils/uploader.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);

// Protected Upload Route (future: add JWT verify middleware here)
app.post('/api/upload', async (req, res) => {
  try {
    const cid = await uploadJSONtoIPFS(req.body);
    res.json({ success: true, cid, link: `https://ipfs.io/ipfs/${cid}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
