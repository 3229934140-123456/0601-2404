import { useNavigate } from 'react-router-dom';
import {
  Play,
  Map,
  ShoppingBag,
  Trophy,
  BarChart3,
  Settings,
  Coins,
  Star,
  Gem,
  MapPin,
  Pickaxe,
  Sparkles,
  Check,
  Gift,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import BackgroundAnimation from '@/components/layout/BackgroundAnimation';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import PixelProgress from '@/components/ui/PixelProgress';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useDailyQuest } from '@/hooks/useDailyQuest';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Pickaxe: <Pickaxe className="w-5 h-5 text-orange-400" />,
  Star: <Star className="w-5 h-5 text-yellow-400" />,
  MapPin: <MapPin className="w-5 h-5 text-blue-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-pink-400" />,
  Trophy: <Trophy className="w-5 h-5 text-amber-400" />,
  Gem: <Gem className="w-5 h-5 text-cyan-400" />,
};

function getIcon(iconName?: string): React.ReactNode {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  return <Star className="w-5 h-5 text-yellow-400" />;
}

export default function MainMenu() {
  const navigate = useNavigate();
  const { coins, gameRecords, mineCarts, currentMineCartId } = usePlayerStore();
  const { quests, claimReward, canClaim } = useDailyQuest();

  const highScore = gameRecords.length > 0
    ? Math.max(...gameRecords.map((r) => r.score))
    : 0;

  const currentMinecart = mineCarts.find((m) => m.id === currentMineCartId);

  const handleStartGame = () => {
    navigate('/level-select');
  };

  const handleLevelSelect = () => {
    navigate('/level-select');
  };

  const handleShop = () => {
    navigate('/shop');
  };

  const handleAchievements = () => {
    navigate('/achievements');
  };

  const handleLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleClaimReward = (questId: string) => {
    claimReward(questId);
  };

  return (
    <MainLayout className="bg-stone-900">
      <BackgroundAnimation speed={0.5} className="opacity-40" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6 md:p-8 overflow-y-auto">
        <div className="w-full flex flex-col items-center gap-6">
          <div className="text-center mt-4">
            <h1
              className="pixel-title text-5xl md:text-7xl font-bold tracking-widest mb-2"
              style={{
                fontFamily: "'Courier New', monospace",
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.3))',
                animation: 'titleFloat 3s ease-in-out infinite',
                imageRendering: 'pixelated',
              }}
            >
              像素矿车
            </h1>
            <p
              className="text-xl md:text-2xl text-amber-300/80 tracking-wider"
              style={{
                fontFamily: "'Courier New', monospace",
                textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
              }}
            >
              PIXEL MINECART
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
            <PixelButton
              variant="primary"
              size="lg"
              icon={<Play className="w-6 h-6" />}
              onClick={handleStartGame}
              className="flex-1"
            >
              开始游戏
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="lg"
              icon={<Map className="w-6 h-6" />}
              onClick={handleLevelSelect}
              className="flex-1"
            >
              关卡选择
            </PixelButton>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
            <PixelButton
              variant="secondary"
              size="md"
              icon={<ShoppingBag className="w-5 h-5" />}
              onClick={handleShop}
              className="w-full"
            >
              道具商店
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="md"
              icon={<Trophy className="w-5 h-5" />}
              onClick={handleAchievements}
              className="w-full"
            >
              成就图鉴
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="md"
              icon={<BarChart3 className="w-5 h-5" />}
              onClick={handleLeaderboard}
              className="w-full"
            >
              排行榜
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="md"
              icon={<Settings className="w-5 h-5" />}
              onClick={handleSettings}
              className="w-full"
            >
              本地设置
            </PixelButton>
          </div>
        </div>

        <PixelCard
          variant="glass"
          padding="md"
          className="w-full max-w-2xl mt-6"
          title={
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="text-amber-200">每日任务</span>
            </div>
          }
        >
          <div className="space-y-3">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  quest.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      quest.completed ? 'bg-green-500/20' : 'bg-white/10'
                    )}
                  >
                    {quest.completed ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      getIcon(quest.icon)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-white truncate">{quest.name}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-mono text-sm">
                          +{quest.reward}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/60 mb-2">{quest.description}</p>
                    <div className="flex items-center gap-3">
                      <PixelProgress
                        value={quest.current}
                        max={quest.target}
                        color={quest.completed ? 'green' : 'tan'}
                        className="flex-1"
                      />
                      {canClaim(quest.id) && (
                        <button
                          onClick={() => handleClaimReward(quest.id)}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all active:scale-95 flex-shrink-0"
                        >
                          领取
                        </button>
                      )}
                      {quest.claimed && (
                        <span className="text-green-400 text-sm font-bold flex-shrink-0">
                          已领取
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>

        <div className="w-full mt-6">
          <PixelCard variant="glass" padding="md" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">金币</p>
                    <p className="text-2xl font-bold text-yellow-400 font-mono">
                      {coins.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">最佳分数</p>
                    <p className="text-2xl font-bold text-amber-400 font-mono">
                      {highScore.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {currentMinecart && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-12 rounded-lg border-2 border-white/20 flex items-center justify-center"
                    style={{ backgroundColor: currentMinecart.id === 'basic' ? '#8B4513' : '#4a4a4a' }}
                  >
                    <span className="text-white text-xs font-bold">
                      {currentMinecart.name.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">当前矿车</p>
                    <p className="text-lg font-bold text-white">{currentMinecart.name}</p>
                  </div>
                </div>
              )}
            </div>
          </PixelCard>
        </div>
      </div>

      <style>{`
        @keyframes titleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .pixel-title {
          position: relative;
          display: inline-block;
        }

        .pixel-title::before {
          content: '';
          position: absolute;
          inset: -10px;
          background: linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </MainLayout>
  );
}
