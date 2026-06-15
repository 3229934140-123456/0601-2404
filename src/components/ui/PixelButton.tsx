import { cn } from '@/lib/utils';
import { type ReactNode, type MouseEvent } from 'react';

export interface PixelButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<NonNullable<PixelButtonProps['variant']>, string> = {
  primary: 'bg-pixel-tan hover:bg-pixel-tan-light text-pixel-brown-dark border-pixel-brown-dark shadow-pixel hover:shadow-pixel-lg',
  secondary: 'bg-pixel-blue hover:bg-pixel-blue-light text-white border-pixel-brown-dark shadow-pixel hover:shadow-pixel-lg',
  danger: 'bg-pixel-red hover:bg-pixel-red-light text-white border-pixel-brown-dark shadow-pixel hover:shadow-pixel-lg',
};

const sizeStyles: Record<NonNullable<PixelButtonProps['size']>, string> = {
  sm: 'px-3 py-2 text-xs gap-1',
  md: 'px-5 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-3',
};

export default function PixelButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  icon,
  className,
}: PixelButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'font-pixel',
        'pixel-border',
        'inline-flex items-center justify-center',
        'transition-all duration-150',
        'hover:scale-105 active:scale-95',
        'active:translate-y-1 active:shadow-none',
        'focus:outline-none focus:ring-2 focus:ring-pixel-blue focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
