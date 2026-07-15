import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  hover?: boolean;
}

export function Card({ children, padded = true, hover, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-brand-100 bg-white shadow-card',
        padded && 'p-5 sm:p-6',
        hover && 'transform-gpu transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-soft',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
