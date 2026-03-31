import express from 'express';
import cors from 'cors';
import { initDB } from './db/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import positionsRouter from './routes/positions.js';
import portfolioRouter from './routes/portfolio.js';
import quotesRouter from './routes/quotes.js';
import dividendsRouter from './routes/dividends.js';
import alertsRouter from './routes/alerts.js';
import riskRouter from './routes/risk.js';
import exportRouter from './routes/export.js';
import { startAlertPolling } from './services/alertService.js';
import { startSnapshotScheduler } from './services/historyService.js';

async function main() {
  await initDB();
  console.log('Database initialized');

  const app = express();
  const PORT = 3001;

  app.use(cors());
  app.use(express.json());

  app.use('/api/positions', positionsRouter);
  app.use('/api/portfolio', portfolioRouter);
  app.use('/api/quotes', quotesRouter);
  app.use('/api/dividends', dividendsRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/risk', riskRouter);
  app.use('/api/export', exportRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startAlertPolling();
    startSnapshotScheduler();
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
