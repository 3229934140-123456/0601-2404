import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Settings,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import GameCanvas, { type GameCanvasHandle } from '@/components/game/GameCanvas';
import GameHUD from '@/components/game/GameHUD';
import GameControls from '@/components/game/GameControls';
import GameOverModal from '@/components/game/GameOverModal';
import PixelModal from '@/components/ui/PixelModal';
import PixelButton from '@/components/ui/PixelButton';
import { AchievementNotificationContainer } from '@/components/game/AchievementNotification';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useDailyQuest } from '@/hooks/useDailyQuest';
import { getLevelById, type Level } from '@/data/levels';
import { getMinecartById } from '@/data/minecarts';
import type { LevelConfig, Minecart as MinecartType } from '@/types';
import type { GameOverStats } from '@/game/engine';
import { cn } from '@/lib/utils';

interface GameLocationState {
  levelId?: string;
  minecartId?: string;
}

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameCanvasRef = useRef<GameCanvasHandle>(null);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSessionStats, setLastSessionStats] = useState<(GameOverStats & {
    levelId?: string;
    minecartId?: string;
  }) | null>(null);
  const [isFinalGameOver, setIsFinalGameOver] = useState(false);
  const [timeState, setTimeState] = useState<{
    remaining?: number;
    limit?: number;
  }>({});
  const [currentEngineState, setCurrentEngineState] = useState<any>(null);

  const { isPaused, isGameOver, resetGame } = useGameStore();
  const { currentMineCartId } = usePlayerStore();
  const {
    soundVolume,
    musicVolume,
    toggleScreenShake,
    toggleParticleEffects,
    screenShake,
    particleEffects,
  } = useSettingsStore();
  const { updateProgress } = useDailyQuest();

  const state = location.state as GameLocationState | null;
  const levelId = state?.levelId || 'level-1';
  const minecartId = state?.minecartId || currentMineCartId;

  const levelData = getLevelById(levelId);
  const minecartData = getMinecartById(minecartId);

  const levelConfig: LevelConfig | null = levelData
    ? {
        id: parseInt(levelData.id.split('-').pop() || '1'),
        name: levelData.name,
        type: levelData.type,
        difficulty: (levelData.difficulty || 1) as 1 | 2 | 3 | 4 | 5,
        timeLimit: levelData.timeLimit,
        background: levelData.background,
        obstacleFrequency: levelData.obstacleFrequency || 0.6,
        oreFrequency: levelData.oreFrequency || 0.7,
        speedMultiplier: levelData.speedMultiplier || 1,
        unlocked: !!levelData.unlocked,
        highScore: 0,
      }
    : null;

  const minecartConfig: MinecartType | null = minecartData
    ? {
        id: parseInt(minecartData.id.split('-').pop() || '1'),
        name: minecartData.name,
        color: minecartData.color,
        speed: minecartData.speed,
        health: minecartData.health,
        price: minecartData.price,
        unlocked: minecartData.unlocked,
        description: minecartData.description,
      }
    : null;

  const handleGameOver = useCallback(
    (stats: GameOverStats) => {
      const enrichedStats = {
        ...stats,
        levelId,
        minecartId,
      };
      setLastSessionStats(enrichedStats);
      setIsFinalGameOver(false);

      updateProgress({ type: 'completeLevels', amount: 1 });
      updateProgress({ type: 'earnScore', amount: stats.score });
      updateProgress({ type: 'travelDistance', amount: Math.floor(stats.distance) });
      updateProgress({ type: 'collectOre', amount: stats.ores });
      updateProgress({ type: 'useItems', amount: stats.itemsUsed.length });
    },
    [levelId, minecartId, updateProgress]
  );

  const handleOreCollected = useCallback(
    (value: number) => {
      updateProgress({ type: 'collectOre', amount: value });
    },
    [updateProgress]
  );

  const handleScoreChange = useCallback(
    (score: number) => {
      updateProgress({ type: 'earnScore', amount: score });
    },
    [updateProgress]
  );

  const handleTimeUpdate = useCallback((remaining: number, limit: number) => {
    setTimeState({ remaining, limit });
  }, []);

  const handleStateChange = useCallback((state: any) => {
    setCurrentEngineState(state);
    const gameStore = useGameStore.getState();
    if (state.isGameOver && !gameStore.isGameOver) {
      gameStore.endGame();
    } else if (state.isPlaying && !state.isGameOver && gameStore.isGameOver) {
      gameStore.startGame();
    }
  }, []);

  const handleUseItem = useCallback(
    (type: 'shield' | 'magnet' | 'boost' | 'doubleScore' | 'revive' | 'extraLife') => {
      if (type === 'extraLife') {
        const engineState = gameCanvasRef.current?.getEngine()?.getState();
        const maxHp = minecartData?.health ?? 100;
        if (engineState && engineState.health >= maxHp) {
          return false;
        }
      }
      const success = gameCanvasRef.current?.useItem(type);
      if (success) {
        updateProgress({ type: 'useItems', amount: 1 });
      }
      return success ?? false;
    },
    [updateProgress, minecartData]
  );

  const handleRevive = useCallback(() => {
    setLastSessionStats(null);
    setIsFinalGameOver(false);
    const { resetGame } = useGameStore.getState();
    resetGame();
    const engine = gameCanvasRef.current?.getEngine();
    if (engine) {
      useGameStore.getState().startGame();
    }
  }, []);

  useEffect(() => {
    if (levelConfig && minecartConfig && !isInitialized && gameCanvasRef.current) {
      gameCanvasRef.current.start(levelConfig, minecartConfig);
      setIsInitialized(true);
      setLastSessionStats(null);
      setIsFinalGameOver(false);
      setTimeState({});
    }
  }, [levelConfig, minecartConfig, isInitialized]);

  useEffect(() => {
    if (isPaused) {
      setShowPauseMenu(true);
    }
  }, [isPaused]);

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  const handleResume = () => {
    setShowPauseMenu(false);
    gameCanvasRef.current?.resume();
  };

  const handlePause = () => {
    gameCanvasRef.current?.pause();
    setShowPauseMenu(true);
  };

  const handleRestart = () => {
    setShowPauseMenu(false);
    setLastSessionStats(null);
    setIsFinalGameOver(false);
    setTimeState({});
    setIsInitialized(false);
    setTimeout(() => {
      if (levelConfig && minecartConfig && gameCanvasRef.current) {
        gameCanvasRef.current.start(levelConfig, minecartConfig);
        setIsInitialized(true);
      }
    }, 50);
  };

  const handleBackToMenu = () => {
    resetGame();
    navigate('/');
  };

  const handleMoveLeft = () => {
    gameCanvasRef.current?.moveLeft();
  };

  const handleMoveRight = () => {
    gameCanvasRef.current?.moveRight();
  };

  const handleJump = () => {
    gameCanvasRef.current?.jump();
  };

  if (!levelConfig || !minecartConfig) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-3">加载错误</h2>
            <p className="text-white/60 mb-2 text-sm">无效的关卡或矿车配置</p>
            <p className="text-amber-400/80 mb-6 text-xs font-mono break-all">
              levelId: {levelId} / minecartId: {minecartId}
            </p>
            <PixelButton variant="primary" onClick={handleBackToMenu}>
              返回主菜单
            </PixelButton>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout className="bg-black" showScanlines={false}>
      <div className="relative w-full h-full overflow-hidden">
        <GameCanvas
          ref={gameCanvasRef}
          className="w-full h-full"
          onGameOver={handleGameOver}
          onOreCollected={handleOreCollected}
          onScoreChange={handleScoreChange}
          onTimeUpdate={handleTimeUpdate}
          onStateChange={handleStateChange}
        />

        <GameHUD
          className="z-20"
          onPause={handlePause}
          onResume={handleResume}
          engineState={currentEngineState}
          remainingTime={timeState.remaining}
          timeLimit={timeState.limit}
          levelType={levelData?.type}
          maxHealth={minecartData?.health}
        />

        <GameControls
          className="z-20"
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onJump={handleJump}
          onUseItem={handleUseItem}
          onRevive={handleRevive}
        />

        <GameOverModal
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
          sessionStats={lastSessionStats || undefined}
          isFinalGameOver={isFinalGameOver}
          onFinalize={() => setIsFinalGameOver(true)}
        />

        <PixelModal
          isOpen={showPauseMenu}
          onClose={handleResume}
          title="游戏暂停"
          className="z-50"
        >
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Pause className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">游戏已暂停</h3>
            </div>

            <div className="space-y-3">
              <PixelButton
                variant="primary"
                size="lg"
                icon={<Play className="w-5 h-5" />}
                onClick={handleResume}
                className="w-full"
              >
                继续游戏
              </PixelButton>

              <PixelButton
                variant="secondary"
                size="lg"
                icon={<RotateCcw className="w-5 h-5" />}
                onClick={handleRestart}
                className="w-full"
              >
                重新开始
              </PixelButton>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={toggleScreenShake}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    screenShake
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10'
                  )}
                >
                  {screenShake ? (
                    <Volume2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white/40" />
                  )}
                  <span className="text-xs text-white/70">
                    震动 {screenShake ? '开' : '关'}
                  </span>
                </button>

                <button
                  onClick={toggleParticleEffects}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    particleEffects
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10'
                  )}
                >
                  <Settings
                    className={cn(
                      'w-6 h-6',
                      particleEffects ? 'text-green-400' : 'text-white/40'
                    )}
                  />
                  <span className="text-xs text-white/70">
                    粒子 {particleEffects ? '开' : '关'}
                  </span>
                </button>
              </div>

              <div className="pt-3">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">音效音量</span>
                    <span className="text-amber-400 font-mono">
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${soundVolume * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">音乐音量</span>
                    <span className="text-amber-400 font-mono">
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${musicVolume * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <PixelButton
                variant="danger"
                size="lg"
                icon={<Home className="w-5 h-5" />}
                onClick={handleBackToMenu}
                className="w-full mt-4"
              >
                返回主菜单
              </PixelButton>
            </div>
          </div>
        </PixelModal>

        <AchievementNotificationContainer />
      </div>
    </MainLayout>
  );
}
