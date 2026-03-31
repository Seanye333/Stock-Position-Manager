import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getHistory } from '../../api/portfolio';
import { format } from 'date-fns';

export default function PerformanceLineChart() {
  const { data: history } = useQuery({ queryKey: ['portfolioHistory'], queryFn: getHistory });

  if (!history || history.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance History</h3>
        <p className="text-gray-500 text-sm py-8 text-center">Capture snapshots to see performance over time</p>
      </div>
    );
  }

  const chartData = history.map(s => ({
    date: s.snapshot_date,
    gainLoss: s.total_gain_loss,
    pct: s.total_cost > 0 ? ((s.total_value - s.total_cost) / s.total_cost * 100) : 0,
  }));

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance History (Gain/Loss)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00c853" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => format(new Date(v + 'T00:00:00'), 'MMM d')} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
          <Tooltip
            contentStyle={{ background: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8, color: '#e5e7eb' }}
            formatter={(v, name) => [name === 'pct' ? `${v.toFixed(2)}%` : `$${v.toFixed(2)}`, name === 'pct' ? 'Return %' : 'Gain/Loss']}
            labelFormatter={v => format(new Date(v + 'T00:00:00'), 'MMM d, yyyy')}
          />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="gainLoss" stroke="#00c853" strokeWidth={2} fill="url(#colorGain)" name="Gain/Loss" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
