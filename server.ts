import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.js';
import { db } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Periodic automatic vesting check (30 seconds)
  setInterval(() => {
    try {
      const raw = db.getRawData();
      const today = new Date().toISOString().split('T')[0];
      let vestedCount = 0;

      raw.grant_cycles.forEach(c => {
        if (c.status === 'pending' && c.vest_date <= today) {
          c.status = 'vested';
          c.vested_at = new Date().toISOString();
          vestedCount++;
        }
      });

      if (vestedCount > 0) {
        raw.cron_execution_logs.unshift({
          id: `cron_${Date.now()}`,
          task_name: '定时期权成熟自动巡检与结算',
          status: 'success',
          checked_count: raw.grant_cycles.length,
          vested_count: vestedCount,
          message: `自动巡检检测到 ${vestedCount} 项期权周期已到达成熟日并已完成自动成熟`,
          executed_at: new Date().toISOString()
        });
        db.persist();
        console.log(`[Engine] Auto-vested ${vestedCount} cycles at ${new Date().toISOString()}`);
      }
    } catch (e) {
      console.error('[Engine] Auto-vesting loop error:', e);
    }
  }, 30000);

  // Global API Error Handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || '服务器处理发生异常'
    });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Equity Incentive System Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
