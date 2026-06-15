import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export interface PixelBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

const variantStyles: Record<NonNullable<PixelBadgeProps['variant']>, string> = {
  success: 'bg-pixel-green text-white border-pixel-brown-dark',
  warning: 'bg-pixel-tan text-pixel-brown-dark border-pixel-brown-dark',
  error: 'bg-pixel-red text-white border-pixel-brown-dark',
  info: 'bg-pixel-blue text-white border-pixel-brown-dark',
};

const sizeStyles: Record<NonNullable<PixelBadgeProps['size']>, string> = {
  sm: 'px-2 py-1 text-[8px]',
  md: 'px-3 py-1.5 text-[10px]',
  lg: 'px-4 py-2 text-xs',
};

const glowColors: Record<NonNullable<PixelBadgeProps['variant']>, string> = {
  success: '#2ECC71',
  warning: '#C4A35A',
  error: '#E74C3C',
  info: '#4A90D9',
};

export default function PixelBadge({
  variant = 'info',
  size = 'md',
  children,
  glow = false,
  className,
}: PixelBadgeProps) {
  return (
    <span
      className={cn(
        'font-pixel',
        'pixel-border-sm',
        'inline-flex items-center justify-center',
        'shadow-pixel-sm',
        'pixel-text-shadow',
        glow && 'animate-pulse',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={glow ? {
        boxShadow: `2px 2px 0 0 #3D2914, 0 0 10px ${glowColors[variant]}, 0 0 20px ${glowColors[variant]}`,
      } : undefined}
    >
      <span className="relative z-10">{children}</span>
    </span>
  );
}
