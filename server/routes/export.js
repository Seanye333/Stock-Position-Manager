import { Router } from 'express';
import { format } from 'fast-csv';
import { all } from '../db/database.js';
import { getBatchQuotes } from '../services/quoteService.js';

const router = Router();

router.get('/positions', async (req, res, next) => {
  try {
    const positions = all('SELECT * FROM positions ORDER BY ticker');
    const tickers = [...new Set(positions.map(p => p.ticker))];
    const quotes = await getBatchQuotes(tickers);

    const today = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="positions_${today}.csv"`);

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    for (const p of positions) {
      const quote = quotes[p.ticker];
      const currentPrice = quote?.price || p.buy_price;
      const marketValue = p.shares * currentPrice;
      const costBasis = p.shares * p.buy_price;
      const gainLoss = marketValue - costBasis;
      const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      csvStream.write({
        Ticker: p.ticker,
        Shares: p.shares,
        'Buy Price': p.buy_price.toFixed(2),
        'Buy Date': p.buy_date,
        'Current Price': currentPrice.toFixed(2),
        'Market Value': marketValue.toFixed(2),
        'Gain/Loss': gainLoss.toFixed(2),
        'Gain/Loss %': gainLossPct.toFixed(2),
        Sector: p.sector || '',
        Notes: p.notes || '',
      });
    }

    csvStream.end();
  } catch (err) { next(err); }
});

router.get('/dividends', (req, res) => {
  const dividends = all(
    `SELECT d.*, p.ticker, p.shares FROM dividends d
     JOIN positions p ON d.position_id = p.id ORDER BY d.ex_date DESC`
  );

  const today = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="dividends_${today}.csv"`);

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for (const d of dividends) {
    csvStream.write({
      Ticker: d.ticker,
      'Amount Per Share': d.amount_per_share.toFixed(4),
      'Total Amount': (d.amount_per_share * d.shares).toFixed(2),
      'Ex Date': d.ex_date,
      'Pay Date': d.pay_date || '',
    });
  }

  csvStream.end();
});

export default router;
