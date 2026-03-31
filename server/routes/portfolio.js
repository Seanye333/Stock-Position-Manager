import { Router } from 'express';
import { all, get } from '../db/database.js';
import { getBatchQuotes } from '../services/quoteService.js';
import { captureSnapshot } from '../services/historyService.js';

const router = Router();

router.get('/summary', async (req, res, next) => {
  try {
    const positions = all('SELECT * FROM positions');
    if (positions.length === 0) {
      return res.json({
        totalValue: 0, totalCost: 0, totalGainLoss: 0, totalGainLossPct: 0,
        totalDayChange: 0, totalDayChangePct: 0, totalDividends: 0,
        positionCount: 0, topPerformers: [], topLosers: [], positions: [],
      });
    }

    const tickers = [...new Set(positions.map(p => p.ticker))];
    const quotes = await getBatchQuotes(tickers);

    let totalValue = 0, totalCost = 0, totalDayChange = 0;
    const enriched = positions.map(p => {
      const quote = quotes[p.ticker];
      const currentPrice = quote?.price || p.buy_price;
      const costBasis = p.shares * p.buy_price;
      const marketValue = p.shares * currentPrice;
      const gainLoss = marketValue - costBasis;
      const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
      const dayChange = p.shares * (quote?.change || 0);

      totalValue += marketValue;
      totalCost += costBasis;
      totalDayChange += dayChange;

      return {
        ...p, currentPrice, costBasis, marketValue, gainLoss, gainLossPct, dayChange,
        name: quote?.name || p.ticker,
      };
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const totalDayChangePct = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

    const sorted = [...enriched].sort((a, b) => b.gainLossPct - a.gainLossPct);
    const topPerformers = sorted.slice(0, 5);
    const topLosers = sorted.slice(-5).reverse();

    const divResult = get(
      `SELECT COALESCE(SUM(d.amount_per_share * p.shares), 0) as totalDividends
       FROM dividends d JOIN positions p ON d.position_id = p.id`
    );

    res.json({
      totalValue, totalCost, totalGainLoss, totalGainLossPct,
      totalDayChange, totalDayChangePct,
      totalDividends: divResult?.totalDividends || 0,
      positionCount: positions.length,
      topPerformers, topLosers,
      positions: enriched,
    });
  } catch (err) { next(err); }
});

router.get('/sectors', async (req, res, next) => {
  try {
    const positions = all('SELECT * FROM positions');
    if (positions.length === 0) return res.json([]);

    const tickers = [...new Set(positions.map(p => p.ticker))];
    const quotes = await getBatchQuotes(tickers);

    const sectorMap = {};
    let totalValue = 0;

    for (const p of positions) {
      const quote = quotes[p.ticker];
      const value = p.shares * (quote?.price || p.buy_price);
      const sector = p.sector || 'Uncategorized';
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
      totalValue += value;
    }

    const sectors = Object.entries(sectorMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percentage: totalValue > 0 ? Math.round((value / totalValue) * 10000) / 100 : 0,
    }));

    res.json(sectors);
  } catch (err) { next(err); }
});

router.get('/history', (req, res) => {
  const { limit } = req.query;
  const snapshots = limit
    ? all('SELECT * FROM portfolio_snapshots ORDER BY snapshot_date ASC LIMIT ?', [parseInt(limit)])
    : all('SELECT * FROM portfolio_snapshots ORDER BY snapshot_date ASC');
  res.json(snapshots);
});

router.post('/snapshot', async (req, res, next) => {
  try {
    const snapshot = await captureSnapshot();
    res.json(snapshot);
  } catch (err) { next(err); }
});

export default router;
