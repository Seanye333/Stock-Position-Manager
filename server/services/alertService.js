import { run, all } from '../db/database.js';
import { getBatchQuotes } from './quoteService.js';

let recentlyTriggered = [];

export async function checkAlerts() {
  const alerts = all('SELECT * FROM price_alerts WHERE is_active = 1');
  if (alerts.length === 0) return [];

  const tickers = [...new Set(alerts.map(a => a.ticker))];
  const quotes = await getBatchQuotes(tickers);
  const triggered = [];

  for (const alert of alerts) {
    const quote = quotes[alert.ticker];
    if (!quote) continue;

    const shouldTrigger =
      (alert.direction === 'above' && quote.price >= alert.target_price) ||
      (alert.direction === 'below' && quote.price <= alert.target_price);

    if (shouldTrigger) {
      const now = new Date().toISOString();
      run('UPDATE price_alerts SET is_active = 0, triggered_at = ? WHERE id = ?', [now, alert.id]);
      const triggeredAlert = { ...alert, is_active: 0, triggered_at: now, currentPrice: quote.price };
      triggered.push(triggeredAlert);
      recentlyTriggered.push(triggeredAlert);
    }
  }

  if (recentlyTriggered.length > 50) {
    recentlyTriggered = recentlyTriggered.slice(-50);
  }

  return triggered;
}

export function getTriggeredAlerts() {
  return recentlyTriggered;
}

export function startAlertPolling() {
  setInterval(async () => {
    try {
      const triggered = await checkAlerts();
      if (triggered.length > 0) {
        console.log(`[Alerts] ${triggered.length} alert(s) triggered:`, triggered.map(a => `${a.ticker} ${a.direction} $${a.target_price}`));
      }
    } catch (err) {
      console.error('[Alerts] Polling error:', err.message);
    }
  }, 2 * 60 * 1000);
  console.log('[Alerts] Polling started (every 2 minutes)');
}
