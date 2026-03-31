import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2979ff', '#00c853', '#ff1744', '#ffd600', '#b388ff', '#00bcd4', '#ff6d00', '#76ff03', '#e040fb', '#18ffff', '#ff3d00', '#69f0ae'];

export default function AllocationPieChart({ positions, title = 'Portfolio Allocation' }) {
  if (!positions || positions.length === 0) return null;

  const data = positions.map(p => ({
    name: p.ticker,
    value: Math.round(p.marketValue * 100) / 100,
  }));

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8, color: '#e5e7eb' }}
            formatter={(v) => [`$${v.toFixed(2)}`, '']}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: 12 }}
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
