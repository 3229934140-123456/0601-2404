import { ArrowLeft, ArrowRight, ArrowUp, Shield, Magnet, Zap } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';
import { useKeyboard } from '@/hooks/useKeyboard';

interface GameControlsProps {
  className?: string;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onJump?: () => void;
  onUseItem?: (type: 'shield' | 'magnet' | 'boost') => boolean;
  showOnMobile?: boolean;
}

interface ItemButtonProps {
  type: 'shield' | 'magnet' | 'boost';
  icon: React.ReactNode;
  count: number;
  disabled?: boolean;
  onUse: () => void;
}

const ItemButton: React.FC<ItemButtonProps> = ({ type, icon, count, disabled, onUse }) => {
  const colors = {
    shield: 'bg-blue-500/30 hover:bg-blue-500/50 border-blue-500/50 active:bg-blue-500/70',
    magnet: 'bg-pink-500/30 hover:bg-pink-500/50 border-pink-500/50 active:bg-pink-500/70',
    boost: 'bg-yellow-500/30 hover:bg-yellow-500/50 border-yellow-500/50 active:bg-yellow-500/70',
  };

  const iconColors = {
    shield: 'text-blue-400',
    magnet: 'text-pink-400',
    boost: 'text-yellow-400',
  };

  return (
    <button
      onClick={onUse}
      disabled={disabled || count <= 0}
      className={cn(
        'relative w-14 h-14 rounded-xl border-2 backdrop-blur-sm transition-all duration-150',
        'flex items-center justify-center',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:scale-95 touch-manipulation',
        colors[type]
      )}
    >
      <div className={cn('w-6 h-6', iconColors[type])}>{icon}</div>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-white text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

const ControlButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ icon, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    onTouchStart={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    className={cn(
      'w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20',
      'backdrop-blur-sm flex items-center justify-center',
      'hover:bg-white/20 active:bg-white/30 active:scale-95',
      'transition-all duration-150 touch-manipulation select-none',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      className
    )}
  >
    {icon}
  </button>
);

export default function GameControls({
  className,
  onMoveLeft,
  onMoveRight,
  onJump,
  onUseItem,
  showOnMobile = true,
}: GameControlsProps) {
  const { isPlaying, isPaused, isGameOver } = useGameStore();
  const { inventory, updateInventory } = usePlayerStore();

  const shieldCount = inventory.find((i) => i.id === 'shield')?.count ?? 0;
  const magnetCount = inventory.find((i) => i.id === 'magnet')?.count ?? 0;
  const boostCount = inventory.find((i) => i.id === 'boost')?.count ?? 0;

  const keyboard = useKeyboard({
    enabled: isPlaying && !isPaused && !isGameOver,
    preventDefault: true,
  });

  const handleMoveLeft = useCallback(() => {
    if (isPlaying && !isPaused && !isGameOver) {
      onMoveLeft?.();
    }
  }, [isPlaying, isPaused, isGameOver, onMoveLeft]);

  const handleMoveRight = useCallback(() => {
    if (isPlaying && !isPaused && !isGameOver) {
      onMoveRight?.();
    }
  }, [isPlaying, isPaused, isGameOver, onMoveRight]);

  const handleJump = useCallback(() => {
    if (isPlaying && !isPaused && !isGameOver) {
      onJump?.();
    }
  }, [isPlaying, isPaused, isGameOver, onJump]);

  const handleUseItem = useCallback(
    (type: 'shield' | 'magnet' | 'boost') => {
      const inventoryKey = type === 'boost' ? 'double_coins' : type;
      const item = inventory.find((i) => i.id === inventoryKey);
      if (!item || item.count <= 0) return;

      const success = onUseItem?.(type);
      if (success !== false) {
        updateInventory(inventoryKey, -1);
      }
    },
    [inventory, onUseItem, updateInventory]
  );

  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;

    if (keyboard.isKeyJustPressed('ArrowLeft') || keyboard.isKeyJustPressed('a') || keyboard.isKeyJustPressed('A')) {
      handleMoveLeft();
    }
    if (keyboard.isKeyJustPressed('ArrowRight') || keyboard.isKeyJustPressed('d') || keyboard.isKeyJustPressed('D')) {
      handleMoveRight();
    }
    if (keyboard.isKeyJustPressed('ArrowUp') || keyboard.isKeyJustPressed('w') || keyboard.isKeyJustPressed('W') || keyboard.isKeyJustPressed(' ')) {
      handleJump();
    }
    if (keyboard.isKeyJustPressed('1')) {
      handleUseItem('shield');
    }
    if (keyboard.isKeyJustPressed('2')) {
      handleUseItem('magnet');
    }
    if (keyboard.isKeyJustPressed('3')) {
      handleUseItem('boost');
    }
  }, [keyboard, isPlaying, isPaused, isGameOver, handleMoveLeft, handleMoveRight, handleJump, handleUseItem]);

  if (!isPlaying && !isPaused) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 p-4 md:p-6',
        'flex items-end justify-between',
        'pointer-events-none',
        showOnMobile ? 'flex' : 'hidden md:flex',
        className
      )}
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        <ItemButton
          type="shield"
          icon={<Shield className="w-full h-full" />}
          count={shieldCount}
          disabled={!isPlaying || isPaused || isGameOver}
          onUse={() => handleUseItem('shield')}
        />
        <ItemButton
          type="magnet"
          icon={<Magnet className="w-full h-full" />}
          count={magnetCount}
          disabled={!isPlaying || isPaused || isGameOver}
          onUse={() => handleUseItem('magnet')}
        />
        <ItemButton
          type="boost"
          icon={<Zap className="w-full h-full" />}
          count={boostCount}
          disabled={!isPlaying || isPaused || isGameOver}
          onUse={() => handleUseItem('boost')}
        />
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          <ControlButton
            icon={<ArrowUp className="w-8 h-8 text-white" />}
            onClick={handleJump}
            disabled={!isPlaying || isPaused || isGameOver}
          />
          <div className="flex items-center gap-2">
            <ControlButton
              icon={<ArrowLeft className="w-8 h-8 text-white" />}
              onClick={handleMoveLeft}
              disabled={!isPlaying || isPaused || isGameOver}
            />
            <ControlButton
              icon={<ArrowRight className="w-8 h-8 text-white" />}
              onClick={handleMoveRight}
              disabled={!isPlaying || isPaused || isGameOver}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
