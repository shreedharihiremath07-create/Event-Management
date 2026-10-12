import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { initDB } from './server/db.js';
import authRouter from './server/routes/auth.js';
import eventsRouter from './server/routes/events.js';
import ticketsRouter from './server/routes/tickets.js';
import leadsRouter from './server/routes/leads.js';
import { createApiProxy } from './server/middleware/apiProxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

const apiProxyTarget = process.env.API_PROXY_TARGET?.trim();
if (apiProxyTarget) {
  app.use('/api', createApiProxy(apiProxyTarget));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', fullstack: true, timestamp: new Date().toISOString() });
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/leads', leadsRouter);

// Serve static files from dist folder if built
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath, { index: false }));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('RSR Event Platform Backend is running. Access API at /api/*');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Initialize database and start listening
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`===========================================`);
      console.log(`🚀 RSR Fullstack Server running on port ${PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/`);
      console.log(`===========================================`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
    process.exit(1);
  }
};

startServer();
