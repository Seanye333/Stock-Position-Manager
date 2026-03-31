import { Router } from 'express';
import { getQuote, getBatchQuotes, getHistoricalPrices } from '../services/quoteService.js';

const router = Router();

// GET batch quotes
router.get('/batch', async (req, res, next) => {
  try {
    const { tickers } = req.query;
    if (!tickers) return res.status(400).json({ error: 'tickers query param required' });
    const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    const quotes = await getBatchQuotes(tickerList);
    res.json(quotes);
  } catch (err) { next(err); }
});

// GET historical prices
router.get('/:ticker/history', async (req, res, next) => {
  try {
    const { period } = req.query;
    const data = await getHistoricalPrices(req.params.ticker.toUpperCase(), period);
    res.json(data);
  } catch (err) { next(err); }
});

// GET single quote
router.get('/:ticker', async (req, res, next) => {
  try {
    const quote = await getQuote(req.params.ticker.toUpperCase());
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (err) { next(err); }
});

export default router;
