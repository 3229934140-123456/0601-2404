import { ArrowLeft, ArrowRight, ArrowUp, Shield, Magnet, Zap, Gauge, RefreshCw, Heart } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';
import { useKeyboard } from '@/hooks/useKeyboard';

type ItemTypeKey = 'shield' | 'magnet' | 'boost' | 'doubleScore' | 'revive' | 'extraLife';

interface GameControlsProps {
  className?: string;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onJump?: () => void;
  onUseItem?: (type: ItemTypeKey) => boolean;
  onRevive?: () => void;
  showOnMobile?: boolean;
}

interface ItemButtonProps {
  type: ItemTypeKey;
  icon: React.ReactNode;
  count: number;
  disabled?: boolean;
  onUse: () => void;
}

const itemConfig: Record<ItemTypeKey, { color: string; iconColor: string; label: string }> = {
  shield: { color: 'bg-blue-500/30 hover:bg-blue-500/50 border-blue-500/50 active:bg-blue-500/70', iconColor: 'text-blue-400', label: '护盾' },
  magnet: { color: 'bg-pink-500/30 hover:bg-pink-500/50 border-pink-500/50 active:bg-pink-500/70', iconColor: 'text-pink-400', label: '磁铁' },
  boost: { color: 'bg-yellow-500/30 hover:bg-yellow-500/50 border-yellow-500/50 active:bg-yellow-500/70', iconColor: 'text-yellow-400', label: '加速' },
  doubleScore: { color: 'bg-purple-500/30 hover:bg-purple-500/50 border-purple-500/50 active:bg-purple-500/70', iconColor: 'text-purple-400', label: '双倍' },
  revive: { color: 'bg-green-500/30 hover:bg-green-500/50 border-green-500/50 active:bg-green-500/70', iconColor: 'text-green-400', label: '复活' },
  extraLife: { color: 'bg-red-500/30 hover:bg-red-500/50 border-red-500/50 active:bg-red-500/70', iconColor: 'text-red-400', label: '生命' },
};

const ItemButton: React.FC<ItemButtonProps> = ({ type, icon, count, disabled, onUse }) => {
  const cfg = itemConfig[type];
  return (
    <button
      onClick={onUse}
      disabled={disabled || count <= 0}
      className={cn(
        'relative w-12 h-12 rounded-xl border-2 backdrop-blur-sm transition-all duration-150',
        'flex items-center justify-center',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:scale-95 touch-manipulation',
        cfg.color
      )}
      title={cfg.label}
    >
      <div className={cn('w-5 h-5', cfg.iconColor)}>{icon}</div>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-white text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center">
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
      'w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20',
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

const inventoryIdMap: Record<ItemTypeKey, string> = {
  shield: 'item-shield',
  magnet: 'item-magnet',
  boost: 'item-speed-boost',
  doubleScore: 'item-double-score',
  revive: 'item-revive',
  extraLife: 'item-extra-life',
};

export default function GameControls({
  className,
  onMoveLeft,
  onMoveRight,
  onJump,
  onUseItem,
  onRevive,
  showOnMobile = true,
}: GameControlsProps) {
  const { isPlaying, isPaused, isGameOver } = useGameStore();
  const { inventory, updateInventory } = usePlayerStore();

  const counts = useCallback(() => {
    const c: Record<ItemTypeKey, number> = {
      shield: 0,
      magnet: 0,
      boost: 0,
      doubleScore: 0,
      revive: 0,
      extraLife: 0,
    };
    for (const key of Object.keys(inventoryIdMap) as ItemTypeKey[]) {
      const invId = inventoryIdMap[key];
      const item = inventory.find((i) => i.itemId === invId);
      c[key] = item?.count ?? 0;
    }
    return c;
  }, [inventory]);

  const itemCounts = counts();

  const keyboard = useKeyboard({
    enabled: isPlaying && !isPaused,
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

  const handleUseItemByKey = useCallback(
    (type: ItemTypeKey) => {
      const invId = inventoryIdMap[type];
      const item = inventory.find((i) => i.itemId === invId);
      if (!item || item.count <= 0) return;

      if (type === 'revive' && !isGameOver) return;
      if (type !== 'revive' && isGameOver) return;

      const success = onUseItem?.(type);
      if (success !== false) {
        updateInventory(invId, -1);
        if (type === 'revive') {
          onRevive?.();
        }
      }
    },
    [inventory, onUseItem, onRevive, updateInventory, isGameOver]
  );

  useEffect(() => {
    if (!isPlaying && !isGameOver) return;
    if (isPaused) return;

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
      handleUseItemByKey('shield');
    }
    if (keyboard.isKeyJustPressed('2')) {
      handleUseItemByKey('magnet');
    }
    if (keyboard.isKeyJustPressed('3')) {
      handleUseItemByKey('doubleScore');
    }
    if (keyboard.isKeyJustPressed('4')) {
      handleUseItemByKey('boost');
    }
    if (keyboard.isKeyJustPressed('5') && isGameOver) {
      handleUseItemByKey('revive');
    }
    if (keyboard.isKeyJustPressed('6')) {
      handleUseItemByKey('extraLife');
    }
  }, [keyboard, isPlaying, isPaused, isGameOver, handleMoveLeft, handleMoveRight, handleJump, handleUseItemByKey]);

  if (!isPlaying && !isPaused && !isGameOver) {
    return null;
  }

  const timedItems: ItemTypeKey[] = ['shield', 'magnet', 'doubleScore', 'boost'];
  const instantItems: ItemTypeKey[] = ['extraLife'];
  const reviveItems: ItemTypeKey[] = ['revive'];

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 p-3 md:p-4',
        'flex items-end justify-between',
        'pointer-events-none',
        showOnMobile ? 'flex' : 'hidden md:flex',
        className
      )}
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          {timedItems.map((type) => (
            <ItemButton
              key={type}
              type={type}
              icon={type === 'shield' ? <Shield className="w-full h-full" /> :
                    type === 'magnet' ? <Magnet className="w-full h-full" /> :
                    type === 'doubleScore' ? <Zap className="w-full h-full" /> :
                    <Gauge className="w-full h-full" />}
              count={itemCounts[type]}
              disabled={!isPlaying || isPaused}
              onUse={() => handleUseItemByKey(type)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {instantItems.map((type) => (
            <ItemButton
              key={type}
              type={type}
              icon={<Heart className="w-full h-full" />}
              count={itemCounts[type]}
              disabled={!isPlaying || isPaused}
              onUse={() => handleUseItemByKey(type)}
            />
          ))}
          {reviveItems.map((type) => (
            <ItemButton
              key={type}
              type={type}
              icon={<RefreshCw className="w-full h-full" />}
              count={itemCounts[type]}
              disabled={!isGameOver || itemCounts[type] <= 0}
              onUse={() => handleUseItemByKey(type)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          <ControlButton
            icon={<ArrowUp className="w-7 h-7 text-white" />}
            onClick={handleJump}
            disabled={!isPlaying || isPaused || isGameOver}
          />
          <div className="flex items-center gap-2">
            <ControlButton
              icon={<ArrowLeft className="w-7 h-7 text-white" />}
              onClick={handleMoveLeft}
              disabled={!isPlaying || isPaused || isGameOver}
            />
            <ControlButton
              icon={<ArrowRight className="w-7 h-7 text-white" />}
              onClick={handleMoveRight}
              disabled={!isPlaying || isPaused || isGameOver}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
