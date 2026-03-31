import clsx from 'clsx';

const variants = {
  primary: 'bg-accent-blue hover:bg-blue-600 text-white',
  danger: 'bg-accent-red/20 hover:bg-accent-red/30 text-accent-red',
  ghost: 'bg-transparent hover:bg-dark-hover text-gray-300',
  success: 'bg-accent-green/20 hover:bg-accent-green/30 text-accent-green',
};

export default function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
