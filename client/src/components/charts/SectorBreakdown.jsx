import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSectors } from '../../api/portfolio';

const COLORS = ['#2979ff', '#00c853', '#ff1744', '#ffd600', '#b388ff', '#00bcd4', '#ff6d00', '#76ff03', '#e040fb', '#18ffff', '#ff3d00'];

export default function SectorBreakdown() {
  const { data: sectors } = useQuery({ queryKey: ['sectors'], queryFn: getSectors });

  if (!sectors || sectors.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Sector Breakdown</h3>
        <p className="text-gray-500 text-sm py-8 text-center">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Sector Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={sectors} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={2}>
            {sectors.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8, color: '#e5e7eb' }}
            formatter={(v, name) => [`$${v.toFixed(2)}`, name]}
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
