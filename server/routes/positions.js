import { Router } from 'express';
import { z } from 'zod';
import { run, all, get } from '../db/database.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

const positionSchema = z.object({
  ticker: z.string().min(1).max(10).transform(v => v.toUpperCase()),
  shares: z.number().positive(),
  buy_price: z.number().positive(),
  buy_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  sector: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

router.get('/', (req, res) => {
  const { sector } = req.query;
  let positions;
  if (sector) {
    positions = all('SELECT * FROM positions WHERE sector = ? ORDER BY ticker', [sector]);
  } else {
    positions = all('SELECT * FROM positions ORDER BY ticker');
  }
  res.json(positions);
});

router.get('/:id', (req, res) => {
  const position = get('SELECT * FROM positions WHERE id = ?', [Number(req.params.id)]);
  if (!position) return res.status(404).json({ error: 'Position not found' });
  res.json(position);
});

router.post('/', validateRequest(positionSchema), (req, res) => {
  const { ticker, shares, buy_price, buy_date, sector, notes } = req.body;
  const result = run(
    'INSERT INTO positions (ticker, shares, buy_price, buy_date, sector, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [ticker, shares, buy_price, buy_date, sector || null, notes || null]
  );
  const position = get('SELECT * FROM positions WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(position);
});

router.put('/:id', validateRequest(positionSchema), (req, res) => {
  const { ticker, shares, buy_price, buy_date, sector, notes } = req.body;
  const existing = get('SELECT * FROM positions WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Position not found' });

  run(
    `UPDATE positions SET ticker = ?, shares = ?, buy_price = ?, buy_date = ?, sector = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
    [ticker, shares, buy_price, buy_date, sector || null, notes || null, Number(req.params.id)]
  );

  const position = get('SELECT * FROM positions WHERE id = ?', [Number(req.params.id)]);
  res.json(position);
});

router.delete('/:id', (req, res) => {
  const existing = get('SELECT * FROM positions WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Position not found' });
  run('DELETE FROM positions WHERE id = ?', [Number(req.params.id)]);
  res.json({ message: 'Position deleted' });
});

export default router;
