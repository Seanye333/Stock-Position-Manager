import { useState, useEffect } from 'react';
import Button from '../common/Button';

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Consumer Discretionary', 'Consumer Staples',
  'Energy', 'Industrials', 'Materials', 'Real Estate', 'Utilities', 'Communication Services',
];

export default function PositionForm({ position, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    ticker: '', shares: '', buy_price: '', buy_date: '', sector: '', notes: '',
  });

  useEffect(() => {
    if (position) {
      setForm({
        ticker: position.ticker || '',
        shares: String(position.shares || ''),
        buy_price: String(position.buy_price || ''),
        buy_date: position.buy_date || '',
        sector: position.sector || '',
        notes: position.notes || '',
      });
    }
  }, [position]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ticker: form.ticker.toUpperCase(),
      shares: parseFloat(form.shares),
      buy_price: parseFloat(form.buy_price),
      buy_date: form.buy_date,
      sector: form.sector || null,
      notes: form.notes || null,
    });
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ticker</label>
          <input
            type="text" value={form.ticker} onChange={set('ticker')} required
            placeholder="AAPL"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Shares</label>
          <input
            type="number" step="any" min="0.001" value={form.shares} onChange={set('shares')} required
            placeholder="10"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Buy Price</label>
          <input
            type="number" step="0.01" min="0.01" value={form.buy_price} onChange={set('buy_price')} required
            placeholder="150.00"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Buy Date</label>
          <input
            type="date" value={form.buy_date} onChange={set('buy_date')} required
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Sector</label>
        <select
          value={form.sector} onChange={set('sector')}
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
        >
          <option value="">Select sector...</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Notes</label>
        <textarea
          value={form.notes} onChange={set('notes')} rows={2}
          placeholder="Optional notes..."
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{position ? 'Update' : 'Add'} Position</Button>
      </div>
    </form>
  );
}
