CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker TEXT NOT NULL,
  shares REAL NOT NULL CHECK(shares > 0),
  buy_price REAL NOT NULL CHECK(buy_price > 0),
  buy_date TEXT NOT NULL,
  sector TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dividends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  position_id INTEGER NOT NULL,
  amount_per_share REAL NOT NULL,
  ex_date TEXT NOT NULL,
  pay_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker TEXT NOT NULL,
  target_price REAL NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('above', 'below')),
  is_active INTEGER DEFAULT 1,
  triggered_at TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL UNIQUE,
  total_value REAL NOT NULL,
  total_cost REAL NOT NULL,
  total_gain_loss REAL NOT NULL,
  snapshot_data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
CREATE INDEX IF NOT EXISTS idx_positions_sector ON positions(sector);
CREATE INDEX IF NOT EXISTS idx_dividends_position ON dividends(position_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts(is_active, ticker);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON portfolio_snapshots(snapshot_date);
