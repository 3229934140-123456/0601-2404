import { ArrowLeft, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showCoins?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  showBack = true,
  showCoins = true,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const coins = usePlayerStore(state => state.coins);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header
      className={cn(
        'w-full px-6 py-4 flex items-center justify-between bg-stone-800/80 border-b-4 border-amber-600',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="pixel-btn-icon w-12 h-12 flex items-center justify-center bg-stone-700 hover:bg-stone-600 border-4 border-stone-600 hover:border-amber-500 transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-6 h-6 text-amber-400" />
          </button>
        )}

        <h1 className="pixel-text text-2xl md:text-3xl font-bold text-amber-400 tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
          {title}
        </h1>
      </div>

      {showCoins && (
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-900/80 border-4 border-amber-600">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span className="pixel-text text-xl font-bold text-yellow-300 tabular-nums drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
            {coins.toLocaleString()}
          </span>
        </div>
      )}

      <style>{`
        .pixel-btn-icon {
          clip-path: polygon(
            0 4px, 4px 4px, 4px 0,
            calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
            100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
            calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
            0 calc(100% - 4px)
          );
        }

        .pixel-text {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
          image-rendering: pixelated;
        }
      `}</style>
    </header>
  );
}
