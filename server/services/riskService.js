import { all } from '../db/database.js';
import { getBatchQuotes, getHistoricalPrices } from './quoteService.js';

function computeReturns(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1].close && prices[i].close) {
      returns.push((prices[i].close - prices[i - 1].close) / prices[i - 1].close);
    }
  }
  return returns;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function covariance(x, y) {
  const n = Math.min(x.length, y.length);
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (x[i] - mx) * (y[i] - my);
  }
  return sum / (n - 1);
}

function variance(arr) {
  const m = mean(arr);
  return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1);
}

export async function computeRiskMetrics() {
  const positions = all('SELECT * FROM positions');
  if (positions.length === 0) {
    return { beta: 0, diversificationScore: 100, sectorConcentration: 0, positionWeights: [] };
  }

  const tickers = [...new Set(positions.map(p => p.ticker))];
  const quotes = await getBatchQuotes(tickers);

  let totalValue = 0;
  const positionValues = {};
  for (const p of positions) {
    const price = quotes[p.ticker]?.price || p.buy_price;
    const value = p.shares * price;
    positionValues[p.ticker] = (positionValues[p.ticker] || 0) + value;
    totalValue += value;
  }

  const weights = {};
  for (const [ticker, value] of Object.entries(positionValues)) {
    weights[ticker] = totalValue > 0 ? value / totalValue : 0;
  }

  const hhi = Object.values(weights).reduce((sum, w) => sum + w * w, 0);
  const diversificationScore = Math.round((1 - hhi) * 100);

  const sectorValues = {};
  for (const p of positions) {
    const sector = p.sector || 'Uncategorized';
    const price = quotes[p.ticker]?.price || p.buy_price;
    sectorValues[sector] = (sectorValues[sector] || 0) + p.shares * price;
  }
  const sectorWeights = Object.values(sectorValues).map(v => v / totalValue);
  const sectorHHI = sectorWeights.reduce((sum, w) => sum + w * w, 0);
  const sectorConcentration = Math.round(sectorHHI * 100);

  let portfolioBeta = 0;
  try {
    const spyHistory = await getHistoricalPrices('SPY', '1y');
    const spyReturns = computeReturns(spyHistory);
    const spyVar = variance(spyReturns);

    if (spyVar > 0 && spyReturns.length > 10) {
      for (const ticker of tickers) {
        const tickerHistory = await getHistoricalPrices(ticker, '1y');
        const tickerReturns = computeReturns(tickerHistory);
        if (tickerReturns.length > 10) {
          const cov = covariance(tickerReturns, spyReturns);
          const beta = cov / spyVar;
          portfolioBeta += (weights[ticker] || 0) * beta;
        }
      }
    }
  } catch (err) {
    console.error('[Risk] Beta calculation error:', err.message);
  }

  const positionWeights = Object.entries(weights).map(([ticker, weight]) => ({
    ticker,
    weight: Math.round(weight * 10000) / 100,
    value: Math.round(positionValues[ticker] * 100) / 100,
  })).sort((a, b) => b.weight - a.weight);

  return {
    beta: Math.round(portfolioBeta * 100) / 100,
    diversificationScore,
    sectorConcentration,
    positionWeights,
  };
}
