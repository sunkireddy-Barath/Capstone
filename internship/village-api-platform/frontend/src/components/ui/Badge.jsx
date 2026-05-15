import clsx from 'clsx';

const variants = {
  green: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
  red: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  amber: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  blue: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30',
  gray: 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30',
  brand: 'bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30',
};

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

export function PlanBadge({ plan }) {
  const map = { FREE: 'gray', PREMIUM: 'blue', PRO: 'purple', UNLIMITED: 'amber' };
  return <Badge variant={map[plan] || 'gray'}>{plan}</Badge>;
}

export function StatusBadge({ active }) {
  return <Badge variant={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Badge>;
}

export function HttpStatusBadge({ code }) {
  const variant = code < 300 ? 'green' : code < 400 ? 'blue' : code < 500 ? 'amber' : 'red';
  return <Badge variant={variant}>{code}</Badge>;
}
