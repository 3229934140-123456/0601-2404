import { cn } from '@/lib/utils';

export interface PixelProgressProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'tan';
  showLabel?: boolean;
  className?: string;
}

const colorStyles: Record<NonNullable<PixelProgressProps['color']>, string> = {
  blue: 'bg-pixel-blue',
  green: 'bg-pixel-green',
  red: 'bg-pixel-red',
  tan: 'bg-pixel-tan',
};

export default function PixelProgress({
  value,
  max = 100,
  color = 'blue',
  showLabel = false,
  className,
}: PixelProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const blockCount = Math.floor(percentage / 10);
  const totalBlocks = 10;

  return (
    <div className={cn('w-full font-pixel', className)}>
      <div className="pixel-border bg-pixel-brown-dark/20 p-1 relative overflow-hidden">
        <div className="flex gap-1 h-6">
          {Array.from({ length: totalBlocks }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex-1 transition-all duration-300',
                'border-2 border-pixel-brown-dark',
                index < blockCount
                  ? cn(colorStyles[color], 'animate-pixel-progress')
                  : 'bg-pixel-gray/30'
              )}
              style={{
                backgroundImage: index < blockCount
                  ? 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)'
                  : 'none',
                backgroundSize: '10px 10px',
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-1 pointer-events-none"
          style={{
            boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.3), inset -2px -2px 0 rgba(255,255,255,0.2)',
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex justify-between text-xs text-pixel-brown-dark">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
