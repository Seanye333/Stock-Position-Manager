import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getPortfolioSummary } from '../../api/portfolio';
import MetricCard from './MetricCard';
import TopPerformers from './TopPerformers';
import PortfolioValueChart from './PortfolioValueChart';
import LoadingSpinner from '../common/LoadingSpinner';

function fmt(n, decimals = 2) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: getPortfolioSummary,
    refetchInterval: 60_000,
  });

  if (isLoading) return <LoadingSpinner />;

  const s = data || {};

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Value"
          value={`$${fmt(s.totalValue)}`}
          subtitle={`${s.positionCount} positions`}
          icon={Wallet}
          color="blue"
        />
        <MetricCard
          title="Total Gain/Loss"
          value={`${s.totalGainLoss >= 0 ? '+' : ''}$${fmt(s.totalGainLoss)}`}
          subtitle={`${s.totalGainLossPct >= 0 ? '+' : ''}${fmt(s.totalGainLossPct)}%`}
          icon={s.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          color={s.totalGainLoss >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Day Change"
          value={`${s.totalDayChange >= 0 ? '+' : ''}$${fmt(s.totalDayChange)}`}
          subtitle={`${s.totalDayChangePct >= 0 ? '+' : ''}${fmt(s.totalDayChangePct)}%`}
          icon={s.totalDayChange >= 0 ? TrendingUp : TrendingDown}
          color={s.totalDayChange >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Dividend Income"
          value={`$${fmt(s.totalDividends)}`}
          subtitle="Total received"
          icon={DollarSign}
          color="purple"
        />
      </div>

      <PortfolioValueChart />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopPerformers title="Top Performers" positions={s.topPerformers} />
        <TopPerformers title="Biggest Losers" positions={s.topLosers} isLosers />
      </div>
    </div>
  );
}
