import { cn } from '@/lib/utils';
import { type ReactNode, type MouseEvent } from 'react';

export interface PixelCardProps {
  variant?: 'default' | 'glass';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  borderColor?: string;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const paddingStyles: Record<NonNullable<PixelCardProps['padding']>, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
  none: 'p-0',
};

const variantStyles: Record<NonNullable<PixelCardProps['variant']>, string> = {
  default: 'bg-pixel-cream shadow-pixel',
  glass: 'bg-pixel-brown/10 backdrop-blur-sm shadow-pixel',
};

export default function PixelCard({
  variant = 'default',
  padding = 'md',
  borderColor = '#3D2914',
  title,
  children,
  className,
  onClick,
}: PixelCardProps) {
  return (
    <div
      className={cn(
        'font-pixel',
        'pixel-border',
        'shadow-pixel-inset',
        'relative',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      style={{ borderColor }}
      onClick={onClick}
    >
      {title && (
        <div className="mb-4 pb-3 border-b-4 border-pixel-brown-dark">
          <h3 className="text-pixel-brown-dark text-sm pixel-text-shadow">
            {title}
          </h3>
        </div>
      )}
      <div className="relative z-10">{children}</div>
      <div
        className="absolute top-1 left-1 w-3 h-3 border-t-4 border-l-4 opacity-30"
        style={{ borderColor }}
      />
      <div
        className="absolute bottom-1 right-1 w-3 h-3 border-b-4 border-r-4 opacity-30"
        style={{ borderColor }}
      />
    </div>
  );
}
