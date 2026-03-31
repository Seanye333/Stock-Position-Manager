import { Router } from 'express';
import { z } from 'zod';
import { run, all, get } from '../db/database.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { checkAlerts, getTriggeredAlerts } from '../services/alertService.js';

const router = Router();

const alertSchema = z.object({
  ticker: z.string().min(1).max(10).transform(v => v.toUpperCase()),
  target_price: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

router.get('/', (req, res) => {
  const { active } = req.query;
  let alerts;
  if (active === 'true') {
    alerts = all('SELECT * FROM price_alerts WHERE is_active = 1 ORDER BY created_at DESC');
  } else {
    alerts = all('SELECT * FROM price_alerts ORDER BY is_active DESC, created_at DESC');
  }
  res.json(alerts);
});

router.get('/triggered', (req, res) => {
  res.json(getTriggeredAlerts());
});

router.post('/', validateRequest(alertSchema), (req, res) => {
  const { ticker, target_price, direction } = req.body;
  const result = run(
    'INSERT INTO price_alerts (ticker, target_price, direction) VALUES (?, ?, ?)',
    [ticker, target_price, direction]
  );
  const alert = get('SELECT * FROM price_alerts WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(alert);
});

router.put('/:id', validateRequest(alertSchema), (req, res) => {
  const existing = get('SELECT * FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Alert not found' });

  const { ticker, target_price, direction } = req.body;
  run(
    'UPDATE price_alerts SET ticker = ?, target_price = ?, direction = ?, is_active = 1, triggered_at = NULL WHERE id = ?',
    [ticker, target_price, direction, Number(req.params.id)]
  );

  const alert = get('SELECT * FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  res.json(alert);
});

router.delete('/:id', (req, res) => {
  const existing = get('SELECT * FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Alert not found' });
  run('DELETE FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  res.json({ message: 'Alert deleted' });
});

router.post('/check', async (req, res, next) => {
  try {
    const triggered = await checkAlerts();
    res.json({ triggered });
  } catch (err) { next(err); }
});

export default router;
