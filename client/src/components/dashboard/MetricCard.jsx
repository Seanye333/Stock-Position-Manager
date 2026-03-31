import clsx from 'clsx';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'text-accent-blue bg-accent-blue/10',
    green: 'text-accent-green bg-accent-green/10',
    red: 'text-accent-red bg-accent-red/10',
    yellow: 'text-accent-yellow bg-accent-yellow/10',
    purple: 'text-accent-purple bg-accent-purple/10',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={clsx('p-2.5 rounded-lg', colorMap[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
