import { run, all } from '../db/database.js';
import { getBatchQuotes } from './quoteService.js';

export async function captureSnapshot() {
  const positions = all('SELECT * FROM positions');
  if (positions.length === 0) return null;

  const tickers = [...new Set(positions.map(p => p.ticker))];
  const quotes = await getBatchQuotes(tickers);

  let totalValue = 0, totalCost = 0;
  const details = positions.map(p => {
    const quote = quotes[p.ticker];
    const currentPrice = quote?.price || p.buy_price;
    const marketValue = p.shares * currentPrice;
    const costBasis = p.shares * p.buy_price;
    totalValue += marketValue;
    totalCost += costBasis;
    return { ticker: p.ticker, shares: p.shares, currentPrice, marketValue, costBasis };
  });

  const today = new Date().toISOString().split('T')[0];
  const totalGainLoss = totalValue - totalCost;

  // Check if snapshot exists for today
  run(
    `DELETE FROM portfolio_snapshots WHERE snapshot_date = ?`,
    [today]
  );
  run(
    `INSERT INTO portfolio_snapshots (snapshot_date, total_value, total_cost, total_gain_loss, snapshot_data) VALUES (?, ?, ?, ?, ?)`,
    [today, totalValue, totalCost, totalGainLoss, JSON.stringify(details)]
  );

  return { snapshot_date: today, total_value: totalValue, total_cost: totalCost, total_gain_loss: totalGainLoss };
}

export function startSnapshotScheduler() {
  setInterval(async () => {
    const now = new Date();
    const etHour = parseInt(now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }));
    const day = now.getDay();
    if (day >= 1 && day <= 5 && etHour === 16) {
      try {
        await captureSnapshot();
        console.log('[Snapshot] Daily snapshot captured');
      } catch (err) {
        console.error('[Snapshot] Error:', err.message);
      }
    }
  }, 60 * 60 * 1000);
  console.log('[Snapshot] Scheduler started (checks hourly for 4 PM ET)');
}
