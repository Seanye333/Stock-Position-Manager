import clsx from 'clsx';

export default function TopPerformers({ title, positions, isLosers = false }) {
  if (!positions || positions.length === 0) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="space-y-3">
        {positions.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium text-sm">{p.ticker}</span>
              <span className="text-gray-500 text-xs ml-2">{p.name}</span>
            </div>
            <div className="text-right">
              <span className={clsx('text-sm font-semibold', p.gainLossPct >= 0 ? 'text-accent-green' : 'text-accent-red')}>
                {p.gainLossPct >= 0 ? '+' : ''}{p.gainLossPct.toFixed(2)}%
              </span>
              <span className="text-gray-500 text-xs ml-2">
                ${Math.abs(p.gainLoss).toFixed(0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
