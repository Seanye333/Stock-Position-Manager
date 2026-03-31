import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getHistory } from '../../api/portfolio';
import { format } from 'date-fns';

export default function PortfolioValueChart() {
  const { data: history } = useQuery({ queryKey: ['portfolioHistory'], queryFn: getHistory });

  if (!history || history.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Portfolio Value Over Time</h3>
        <p className="text-gray-500 text-sm py-8 text-center">
          No snapshots yet. Click "Snapshot" in the header to capture your first one.
        </p>
      </div>
    );
  }

  const chartData = history.map(s => ({
    date: s.snapshot_date,
    value: s.total_value,
    cost: s.total_cost,
  }));

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Portfolio Value Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2979ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2979ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => format(new Date(v + 'T00:00:00'), 'MMM d')} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8, color: '#e5e7eb' }}
            formatter={(v) => [`$${v.toFixed(2)}`, '']}
            labelFormatter={v => format(new Date(v + 'T00:00:00'), 'MMM d, yyyy')}
          />
          <Area type="monotone" dataKey="cost" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" fill="none" name="Cost Basis" />
          <Area type="monotone" dataKey="value" stroke="#2979ff" strokeWidth={2} fill="url(#colorValue)" name="Market Value" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
