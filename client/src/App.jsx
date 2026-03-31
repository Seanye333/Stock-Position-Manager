import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './components/dashboard/DashboardPage';
import PositionsPage from './components/positions/PositionsPage';
import ChartsPage from './components/charts/ChartsPage';
import DividendsPage from './components/dividends/DividendsPage';
import AlertsPage from './components/alerts/AlertsPage';
import RiskPage from './components/risk/RiskPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/positions" element={<PositionsPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/dividends" element={<DividendsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/risk" element={<RiskPage />} />
      </Route>
    </Routes>
  );
}
