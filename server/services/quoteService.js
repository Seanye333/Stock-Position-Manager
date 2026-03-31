import yahooFinance from 'yahoo-finance2';

const cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds

export async function getQuote(ticker) {
  const cached = cache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  try {
    const result = await yahooFinance.quote(ticker);
    const data = {
      ticker,
      price: result.regularMarketPrice,
      previousClose: result.regularMarketPreviousClose,
      change: result.regularMarketChange,
      changePercent: result.regularMarketChangePercent,
      volume: result.regularMarketVolume,
      marketCap: result.marketCap,
      name: result.shortName || result.longName || ticker,
      dayHigh: result.regularMarketDayHigh,
      dayLow: result.regularMarketDayLow,
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow,
    };
    cache.set(ticker, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(`Failed to fetch quote for ${ticker}:`, err.message);
    return null;
  }
}

export async function getBatchQuotes(tickers) {
  const results = {};
  await Promise.all(
    tickers.map(async (t) => {
      results[t] = await getQuote(t);
    })
  );
  return results;
}

export async function getHistoricalPrices(ticker, period = '3mo') {
  try {
    const now = new Date();
    let period1;
    switch (period) {
      case '1mo': period1 = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
      case '3mo': period1 = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
      case '6mo': period1 = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); break;
      case '1y': period1 = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
      default: period1 = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }
    const result = await yahooFinance.chart(ticker, {
      period1: period1.toISOString().split('T')[0],
      period2: now.toISOString().split('T')[0],
      interval: '1d',
    });
    return result.quotes.map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));
  } catch (err) {
    console.error(`Failed to fetch history for ${ticker}:`, err.message);
    return [];
  }
}

export function clearCache() {
  cache.clear();
}
