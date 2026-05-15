import clsx from 'clsx';
import Spinner from './Spinner';

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className, ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 hover:text-gray-200 text-sm font-medium rounded-lg transition-colors duration-150',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: '', lg: 'px-6 py-3 text-base' };

  return (
    <button
      disabled={disabled || loading}
      className={clsx(variants[variant], sizes[size] !== '' && sizes[size], className)}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
