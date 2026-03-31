import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, PieChart, DollarSign, Bell, Shield, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/positions', icon: List, label: 'Positions' },
  { to: '/charts', icon: PieChart, label: 'Charts' },
  { to: '/dividends', icon: DollarSign, label: 'Dividends' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/risk', icon: Shield, label: 'Risk' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-dark-card border-r border-dark-border flex flex-col shrink-0">
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-accent-blue" size={24} />
          <span className="text-lg font-bold text-white">StockPortfolio</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent-blue/15 text-accent-blue'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover'
            )}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
