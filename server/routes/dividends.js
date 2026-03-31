import { Router } from 'express';
import { z } from 'zod';
import { run, all, get } from '../db/database.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

const dividendSchema = z.object({
  position_id: z.number().int().positive(),
  amount_per_share: z.number().positive(),
  ex_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pay_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

router.get('/', (req, res) => {
  const { position_id } = req.query;
  let dividends;
  if (position_id) {
    dividends = all(
      `SELECT d.*, p.ticker FROM dividends d JOIN positions p ON d.position_id = p.id WHERE d.position_id = ? ORDER BY d.ex_date DESC`,
      [Number(position_id)]
    );
  } else {
    dividends = all(
      `SELECT d.*, p.ticker FROM dividends d JOIN positions p ON d.position_id = p.id ORDER BY d.ex_date DESC`
    );
  }
  res.json(dividends);
});

router.get('/summary', (req, res) => {
  const summary = all(
    `SELECT p.ticker, p.shares, p.buy_price,
            SUM(d.amount_per_share) as total_per_share,
            SUM(d.amount_per_share * p.shares) as total_income,
            COUNT(d.id) as payment_count
     FROM dividends d
     JOIN positions p ON d.position_id = p.id
     GROUP BY p.id
     ORDER BY total_income DESC`
  );
  const totalIncome = summary.reduce((sum, s) => sum + s.total_income, 0);
  res.json({ totalIncome, byPosition: summary });
});

router.post('/', validateRequest(dividendSchema), (req, res) => {
  const { position_id, amount_per_share, ex_date, pay_date } = req.body;
  const position = get('SELECT * FROM positions WHERE id = ?', [position_id]);
  if (!position) return res.status(404).json({ error: 'Position not found' });

  const result = run(
    'INSERT INTO dividends (position_id, amount_per_share, ex_date, pay_date) VALUES (?, ?, ?, ?)',
    [position_id, amount_per_share, ex_date, pay_date || null]
  );

  const dividend = get(
    'SELECT d.*, p.ticker FROM dividends d JOIN positions p ON d.position_id = p.id WHERE d.id = ?',
    [result.lastInsertRowid]
  );
  res.status(201).json(dividend);
});

router.delete('/:id', (req, res) => {
  const existing = get('SELECT * FROM dividends WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Dividend not found' });
  run('DELETE FROM dividends WHERE id = ?', [Number(req.params.id)]);
  res.json({ message: 'Dividend deleted' });
});

export default router;
