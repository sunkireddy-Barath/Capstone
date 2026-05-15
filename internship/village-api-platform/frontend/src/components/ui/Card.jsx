import clsx from 'clsx';

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx('card animate-fade-in', className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-400 bg-brand-500/10',
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  };
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        {Icon && (
          <div className={clsx('p-2 rounded-lg', accents[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-100 mt-2">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
