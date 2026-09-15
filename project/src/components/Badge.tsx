import { type ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const variants: Record<Variant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  neutral: 'bg-gray-100 text-gray-700',
  primary: 'bg-emerald-600 text-white',
};

export default function Badge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
