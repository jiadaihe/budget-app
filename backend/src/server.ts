import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { signup } from './app/signup/route';
import { login } from './app/login/route';
import { getProfile } from './app/profile/route';
import { analyzeImage, getModelStatus, uploadImage } from './app/analyze/route';
import { authenticateToken } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dataset directory
app.use('/dataset', express.static(path.join(__dirname, '../../dataset')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);

// Protected routes
app.get('/api/profile', authenticateToken, getProfile);

// AI Analysis routes
app.post('/api/upload', uploadImage);
app.post('/api/analyze', analyzeImage);
app.get('/api/analyze/status', getModelStatus);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Signup: POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`Profile: GET http://localhost:${PORT}/api/profile`);
    console.log(`Analyze: POST http://localhost:${PORT}/api/analyze`);
    console.log(`Model Status: GET http://localhost:${PORT}/api/analyze/status`);
    console.log(`Dataset images: http://localhost:${PORT}/dataset/`);
  });
}

export default app; 