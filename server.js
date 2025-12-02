// Express server for self-hosting (alternative to Vercel)
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API handlers
import chatHandler from './api/chat.js';
import configHandler from './api/config.js';
import healthHandler from './api/health.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// API Routes
app.all('/api/chat', (req, res) => chatHandler(req, res));
app.all('/api/config', (req, res) => configHandler(req, res));
app.all('/api/health', (req, res) => healthHandler(req, res));

// Serve widget files with proper headers
app.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  // Disable caching during active development/debugging to ensure latest widget is served
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

app.get('/widget.min.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  // Disable caching during active development/debugging to ensure latest widget is served
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'widget.min.js'));
});

// Default route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Chatbot Assistant',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      chat: '/api/chat',
      config: '/api/config',
      health: '/api/health',
      widget: '/widget.js',
      test: '/test.html',
      mobileTest: '/mobile-test.html'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Chatbot Assistant server running on port ${PORT}`);
  console.log(`📱 Widget URL: http://localhost:${PORT}/widget.js`);
  console.log(`🧪 Test page: http://localhost:${PORT}/test.html`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
