import { useRef, useEffect, useMemo } from 'react';
import { Gauge, Heart, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPixelArtCanvas } from '@/utils/pixel';

interface MinecartPreviewProps {
  className?: string;
  color: string;
  speed: number;
  health: number;
  name: string;
  description?: string;
  unlocked?: boolean;
  price?: number;
  selected?: boolean;
  showStats?: boolean;
  scale?: number;
  animate?: boolean;
}

function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.floor(r * (1 - amount));
  const newG = Math.floor(g * (1 - amount));
  const newB = Math.floor(b * (1 - amount));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function drawPixelMinecart(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  height: number,
  wheelRotation: number = 0
): void {
  const px = (x: number, y: number, w: number, h: number) => {
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
  };

  const bodyX = 5;
  const bodyY = 10;
  const bodyW = width - 10;
  const bodyH = height - 25;

  ctx.fillStyle = color;
  px(bodyX, bodyY, bodyW, bodyH);

  ctx.fillStyle = lightenColor(color, 0.2);
  px(bodyX, bodyY, bodyW, 4);
  px(bodyX, bodyY, 4, bodyH);

  ctx.fillStyle = darkenColor(color, 0.3);
  px(0, height - 25, width, 15);

  ctx.fillStyle = '#2a2a3a';
  px(8, 0, width - 16, 15);

  ctx.fillStyle = '#87ceeb';
  px(12, 3, width - 24, 10);

  ctx.fillStyle = lightenColor('#87ceeb', 0.3);
  px(12, 3, width - 24, 3);

  ctx.fillStyle = '#ffd700';
  px(15, 18, 8, 8);
  px(width - 23, 18, 8, 8);

  ctx.fillStyle = lightenColor('#ffd700', 0.3);
  px(15, 18, 3, 3);
  px(width - 23, 18, 3, 3);

  const wheelRadius = 12;
  const wheelY = height - 12;

  const drawWheel = (x: number, y: number, radius: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spokeX = Math.cos(angle) * radius * 0.5;
      const spokeY = Math.sin(angle) * radius * 0.5;
      ctx.fillRect(spokeX - 2, spokeY - 2, 4, 4);
    }

    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawWheel(15, wheelY, wheelRadius, wheelRotation);
  drawWheel(width - 15, wheelY, wheelRadius, wheelRotation);
}

export default function MinecartPreview({
  className,
  color,
  speed,
  health,
  name,
  description,
  unlocked = true,
  price,
  selected = false,
  showStats = true,
  scale = 1,
  animate = false,
}: MinecartPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const wheelRotationRef = useRef(0);

  const canvasWidth = useMemo(() => Math.floor(70 * scale), [scale]);
  const canvasHeight = useMemo(() => Math.floor(60 * scale), [scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.imageSmoothingEnabled = false;

      if (animate && unlocked) {
        wheelRotationRef.current += 0.05;
      }

      ctx.save();
      ctx.scale(scale, scale);
      drawPixelMinecart(ctx, color, 70, 60, wheelRotationRef.current);
      ctx.restore();

      if (animate && unlocked) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, canvasWidth, canvasHeight, scale, animate, unlocked]);

  const speedStars = useMemo(() => {
    const normalizedSpeed = Math.min(Math.max((speed - 0.8) / 0.7, 0), 1);
    return Math.round(normalizedSpeed * 5);
  }, [speed]);

  const healthHearts = useMemo(() => {
    const normalizedHealth = Math.min(Math.max((health - 80) / 100, 0), 1);
    return Math.max(1, Math.round(normalizedHealth * 5));
  }, [health]);

  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl border-2 transition-all duration-300',
        'flex flex-col items-center gap-3',
        selected
          ? 'bg-gradient-to-b from-white/10 to-white/5 border-yellow-500 shadow-lg shadow-yellow-500/20'
          : 'bg-white/5 border-white/10 hover:border-white/20',
        !unlocked && 'opacity-60',
        className
      )}
    >
      {selected && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
          <Sparkles className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">已选择</span>
        </div>
      )}

      {!unlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-8 h-8 text-white/80" />
            {price !== undefined && price > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/40">
                <span className="text-yellow-400 font-bold font-mono">{price}</span>
                <span className="text-yellow-400/80 text-xs">金币</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        {description && (
          <p className="text-xs text-white/60 mt-1 max-w-[180px]">{description}</p>
        )}
      </div>

      {showStats && (
        <div className="w-full space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-white/70">速度</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2.5 h-2.5 rounded-sm',
                    i < speedStars ? 'bg-yellow-400' : 'bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white/70">生命</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'w-3 h-3 transition-colors',
                    i < healthHearts
                      ? 'text-red-400 fill-red-400'
                      : 'text-white/10 fill-transparent'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { createPixelArtCanvas, drawPixelMinecart };
