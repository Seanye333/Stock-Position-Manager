import { useQuery } from '@tanstack/react-query';
import { getPortfolioSummary } from '../../api/portfolio';
import AllocationPieChart from './AllocationPieChart';
import SectorBreakdown from './SectorBreakdown';
import PerformanceLineChart from './PerformanceLineChart';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ChartsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: getPortfolioSummary,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Charts & Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationPieChart positions={data?.positions} />
        <SectorBreakdown />
      </div>
      <PerformanceLineChart />
    </div>
  );
}
