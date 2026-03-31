import { useQuery } from '@tanstack/react-query';
import { Shield, BarChart3, PieChart } from 'lucide-react';
import clsx from 'clsx';
import { getRiskMetrics } from '../../api/risk';
import LoadingSpinner from '../common/LoadingSpinner';

function RiskGauge({ label, value, max = 100, unit = '', color = 'blue', description }) {
  const pct = Math.min((Math.abs(value) / max) * 100, 100);
  const colorMap = { blue: 'bg-accent-blue', green: 'bg-accent-green', red: 'bg-accent-red', yellow: 'bg-accent-yellow' };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white mb-2">{value}{unit}</p>
      <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden mb-2">
        <div className={clsx('h-full rounded-full transition-all', colorMap[color])} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function RiskPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['riskMetrics'],
    queryFn: getRiskMetrics,
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.positionWeights.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold text-white">Risk Analysis</h1>
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <p className="text-gray-400">Add positions to see risk metrics.</p>
        </div>
      </div>
    );
  }

  const betaColor = data.beta > 1.2 ? 'red' : data.beta > 0.8 ? 'yellow' : 'green';
  const betaDesc = data.beta > 1.2 ? 'High volatility relative to market' : data.beta > 0.8 ? 'Similar volatility to market' : 'Lower volatility than market';

  const divColor = data.diversificationScore > 70 ? 'green' : data.diversificationScore > 40 ? 'yellow' : 'red';
  const divDesc = data.diversificationScore > 70 ? 'Well diversified portfolio' : data.diversificationScore > 40 ? 'Moderately diversified' : 'Concentrated portfolio - consider diversifying';

  const concColor = data.sectorConcentration > 60 ? 'red' : data.sectorConcentration > 30 ? 'yellow' : 'green';
  const concDesc = data.sectorConcentration > 60 ? 'Heavy sector concentration' : data.sectorConcentration > 30 ? 'Moderate sector concentration' : 'Good sector diversification';

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Risk Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskGauge label="Portfolio Beta" value={data.beta} max={2} color={betaColor} description={betaDesc} />
        <RiskGauge label="Diversification Score" value={data.diversificationScore} max={100} color={divColor} description={divDesc} />
        <RiskGauge label="Sector Concentration" value={data.sectorConcentration} max={100} unit="%" color={concColor} description={concDesc} />
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <BarChart3 size={16} /> Position Weights
        </h3>
        <div className="space-y-3">
          {data.positionWeights.map(pw => (
            <div key={pw.ticker} className="flex items-center gap-4">
              <span className="text-white font-medium w-16">{pw.ticker}</span>
              <div className="flex-1 h-6 bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-accent-blue/60 rounded-full flex items-center pl-2" style={{ width: `${pw.weight}%` }}>
                  {pw.weight > 10 && <span className="text-[10px] text-white font-medium">{pw.weight}%</span>}
                </div>
              </div>
              <span className="text-gray-400 text-sm w-20 text-right">${pw.value.toLocaleString()}</span>
              <span className="text-gray-500 text-sm w-14 text-right">{pw.weight}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
