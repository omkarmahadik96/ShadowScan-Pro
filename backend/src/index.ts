import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { logger } from './utils/logger';

dotenv.config();

// GLOBAL_ERROR_SHIELD: Prevent process termination on tactical failures
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8
});

(global as any).io = io;

import findingsRoutes from './api/routes/findings';
import watchlistRoutes from './api/routes/watchlist';
import statsRoutes from './api/routes/stats';
import adversariesRoutes from './api/routes/adversaries';
import routingRoutes from './api/routes/routing';
import systemRoutes from './api/routes/system';
import countermeasureRoutes from './api/routes/countermeasures';
import reportsRoutes from './api/routes/reports';
import alertsRoutes from './api/routes/alerts';
import operatorsRoutes from './api/routes/operators';
import { monitoringScheduler } from './services/monitoring/scheduler';
import { systemPerformanceService } from './services/systemPerformance';

app.set('io', io);

// TACTICAL FIX: Relaxed security headers for stable WebSocket uplink
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP. Tactical lockout engaged.' }
});
app.use('/api/', limiter);

app.disable('x-powered-by');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/findings', findingsRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/adversaries', adversariesRoutes);
app.use('/api/v1/routing', routingRoutes);
app.use('/api/v1/countermeasures', countermeasureRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/operators', operatorsRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, status: 'OPERATIONAL', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

io.on('connection', async (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  try {
    const { statsService } = require('./services/stats');
    const stats = await statsService.getStatsGlobal();
    socket.emit('stats_update', stats);
    
    const { realWorldDetector } = require('./services/monitoring/realWorldDetector');
    socket.emit('world_grid_update', {
      intel: realWorldDetector.getIntel(),
      log: '[INIT] Secure tactical uplink established.'
    });
  } catch (e) {
    logger.error('[SOCKET] Connection init error:', e);
  }

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled Exception', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

process.on('uncaughtException', (error) => {
  logger.error(`🔥 CRITICAL_KERNEL_PANIC: ${error.message}`, error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️ UNHANDLED_UPLINK_REJECTION', reason);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`\n  [SYSTEM_STATUS] CORE_ENGINE_ACTIVE // PORT: ${PORT} // v2.4.1_GOLD_MASTER`);
  console.log(`  [UPLINK_READY]  INTELLIGENCE_LATTICE_ESTABLISHED\n`);

  const { configStore } = require('./services/configStore');
  configStore.onUpdate(() => {
    monitoringScheduler.restart();
  });

  monitoringScheduler.start();

  setInterval(() => {
    try {
      const statsModule = require('./services/stats');
      if (statsModule.statsService) {
        statsModule.statsService.broadcast();
      }
    } catch (err) {}
  }, 2000);
});
