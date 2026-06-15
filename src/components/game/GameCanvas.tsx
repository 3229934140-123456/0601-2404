import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Ref } from 'react';
import { GameEngine, type EngineCallbacks, type GameOverStats } from '@/game/engine';
import type { LevelConfig, Minecart } from '@/types';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export interface GameCanvasHandle {
  start: (level: LevelConfig, minecart: Minecart) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  stop: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  jump: () => void;
  useItem: (type: 'shield' | 'magnet' | 'boost' | 'doubleScore' | 'revive' | 'extraLife') => boolean;
  getEngine: () => GameEngine | null;
}

interface GameCanvasProps {
  className?: string;
  onStateChange?: EngineCallbacks['onStateChange'];
  onCollision?: EngineCallbacks['onCollision'];
  onGameOver?: (stats: GameOverStats) => void;
  onScoreChange?: EngineCallbacks['onScoreChange'];
  onOreCollected?: EngineCallbacks['onOreCollected'];
  onTimeUpdate?: EngineCallbacks['onTimeUpdate'];
  width?: number;
  height?: number;
}

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(function GameCanvas(
  {
    className,
    onStateChange,
    onCollision,
    onGameOver,
    onScoreChange,
    onOreCollected,
    onTimeUpdate,
    width = 800,
    height = 600,
  },
  ref: Ref<GameCanvasHandle>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startGame, endGame, pauseGame, resumeGame } = useGameStore();

  const initEngine = useCallback(() => {
    if (!canvasRef.current || engineRef.current) return;

    const callbacks: EngineCallbacks = {
      onStateChange: (state) => {
        onStateChange?.(state);
      },
      onCollision: (result) => {
        onCollision?.(result);
      },
      onGameOver: (stats) => {
        endGame();
        onGameOver?.(stats);
      },
      onScoreChange: (score) => {
        onScoreChange?.(score);
      },
      onOreCollected: (value) => {
        onOreCollected?.(value);
      },
      onTimeUpdate: (remaining, limit) => {
        onTimeUpdate?.(remaining, limit);
      },
    };

    engineRef.current = new GameEngine(canvasRef.current, {
      canvasWidth: width,
      canvasHeight: height,
    }, callbacks);
  }, [width, height, onStateChange, onCollision, onGameOver, onScoreChange, onOreCollected, onTimeUpdate, endGame]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !engineRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.floor(rect.width);
    const newHeight = Math.floor(rect.height);

    engineRef.current.resize(newWidth, newHeight);
  }, []);

  useEffect(() => {
    initEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [initEngine]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useImperativeHandle(ref, () => ({
    start: (level: LevelConfig, minecart: Minecart) => {
      startGame();
      engineRef.current?.start(level, minecart);
    },
    pause: () => {
      pauseGame();
      engineRef.current?.pause();
    },
    resume: () => {
      resumeGame();
      engineRef.current?.resume();
    },
    restart: () => {
      engineRef.current?.restart();
    },
    stop: () => {
      engineRef.current?.stop();
    },
    moveLeft: () => {
      engineRef.current?.moveLeft();
    },
    moveRight: () => {
      engineRef.current?.moveRight();
    },
    jump: () => {
      engineRef.current?.jump();
    },
    useItem: (type: 'shield' | 'magnet' | 'boost' | 'doubleScore' | 'revive' | 'extraLife') => {
      return engineRef.current?.useItem(type) ?? false;
    },
    getEngine: () => engineRef.current,
  }));

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden bg-black', className)}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
});

export default GameCanvas;
