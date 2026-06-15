import { useState, useMemo } from 'react';
import { Trophy, Play, Medal, Calendar, Coins, Gauge, Gem, ChevronRight, Clock, Filter } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import PixelModal from '@/components/ui/PixelModal';
import PixelBadge from '@/components/ui/PixelBadge';
import { usePlayerStore, type GameRecord } from '@/store/usePlayerStore';
import { levels } from '@/data/levels';
import { getMinecartById } from '@/data/minecarts';
import { cn } from '@/lib/utils';

type TabType = 'scores' | 'replays';
type LevelTypeFilter = 'all' | 'normal' | 'timed';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  avatar: string;
  score: number;
  date: number;
  levelId: string;
}

const mockLeaderboardData: Record<string, LeaderboardEntry[]> = {
  'level-1': [
    { rank: 1, playerName: '矿车大师', avatar: '👑', score: 12500, date: Date.now() - 86400000, levelId: 'level-1' },
    { rank: 2, playerName: '钻石猎人', avatar: '💎', score: 10800, date: Date.now() - 172800000, levelId: 'level-1' },
    { rank: 3, playerName: '速度之王', avatar: '⚡', score: 9600, date: Date.now() - 259200000, levelId: 'level-1' },
    { rank: 4, playerName: '新手玩家', avatar: '🎮', score: 7200, date: Date.now() - 345600000, levelId: 'level-1' },
    { rank: 5, playerName: '冒险家', avatar: '🗺️', score: 5800, date: Date.now() - 432000000, levelId: 'level-1' },
  ],
  'level-2': [
    { rank: 1, playerName: '暗影行者', avatar: '🌑', score: 15200, date: Date.now() - 86400000, levelId: 'level-2' },
    { rank: 2, playerName: '矿车大师', avatar: '👑', score: 13400, date: Date.now() - 172800000, levelId: 'level-2' },
    { rank: 3, playerName: '隧道专家', avatar: '🔦', score: 11100, date: Date.now() - 259200000, levelId: 'level-2' },
  ],
  'level-3': [
    { rank: 1, playerName: '水晶守护者', avatar: '💠', score: 18900, date: Date.now() - 86400000, levelId: 'level-3' },
    { rank: 2, playerName: '矿车大师', avatar: '👑', score: 16500, date: Date.now() - 172800000, levelId: 'level-3' },
  ],
  'timed-1': [
    { rank: 1, playerName: '闪电手速', avatar: '⚡', score: 8500, date: Date.now() - 86400000, levelId: 'timed-1' },
    { rank: 2, playerName: '限时王者', avatar: '⏱️', score: 7200, date: Date.now() - 172800000, levelId: 'timed-1' },
  ],
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-gray-400';
    case 3:
      return 'text-amber-600';
    default:
      return 'text-pixel-brown-dark';
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-500/20';
    case 2:
      return 'bg-gray-400/20';
    case 3:
      return 'bg-amber-600/20';
    default:
      return 'bg-pixel-cream';
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatTime = (seconds?: number) => {
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TabType>('scores');
  const [selectedLevel, setSelectedLevel] = useState<string>('level-1');
  const [selectedRecord, setSelectedRecord] = useState<GameRecord | null>(null);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [levelTypeFilter, setLevelTypeFilter] = useState<LevelTypeFilter>('all');

  const gameRecords = usePlayerStore((state) => state.gameRecords);

  const levelOptions = useMemo(() => {
    return levels.filter((level) => {
      if (levelTypeFilter === 'all') return true;
      return level.type === levelTypeFilter;
    });
  }, [levelTypeFilter]);

  const currentLevelData = mockLeaderboardData[selectedLevel] || [];
  const currentLevel = levels.find((l) => l.id === selectedLevel);

  const playerBestScores = useMemo(() => {
    const scores: Record<string, number> = {};
    gameRecords.forEach((record) => {
      const lid = record.levelId || 'level-1';
      if (!scores[lid] || record.score > scores[lid]) {
        scores[lid] = record.score;
      }
    });
    return scores;
  }, [gameRecords]);

  const filteredRecords = useMemo(() => {
    return [...gameRecords]
      .filter((r) => {
        if (levelTypeFilter === 'all') return true;
        return (r.levelType || 'normal') === levelTypeFilter;
      })
      .sort((a, b) => b.score - a.score);
  }, [gameRecords, levelTypeFilter]);

  const handleViewReplay = (record: GameRecord) => {
    setSelectedRecord(record);
    setShowReplayModal(true);
  };

  const closeReplayModal = () => {
    setShowReplayModal(false);
    setSelectedRecord(null);
  };

  const highestScore = filteredRecords[0]?.score || 0;
  const totalDistance = filteredRecords.reduce((sum, r) => sum + r.distance, 0);
  const totalOres = filteredRecords.reduce((sum, r) => sum + r.oreCount, 0);

  return (
    <div className="min-h-screen bg-stone-900">
      <PageHeader title="排行榜" showBack showCoins />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <PixelCard padding="sm" variant="glass" className="text-center">
            <div className="text-xs text-pixel-gray mb-1">总游戏次数</div>
            <div className="text-2xl font-bold text-pixel-brown-dark">{filteredRecords.length}</div>
          </PixelCard>
          <PixelCard padding="sm" variant="glass" className="text-center">
            <div className="text-xs text-pixel-gray mb-1">最高分数</div>
            <div className="text-2xl font-bold text-pixel-red">{highestScore.toLocaleString()}</div>
          </PixelCard>
          <PixelCard padding="sm" variant="glass" className="text-center">
            <div className="text-xs text-pixel-gray mb-1">累计距离</div>
            <div className="text-2xl font-bold text-pixel-blue">{Math.floor(totalDistance)}m</div>
          </PixelCard>
          <PixelCard padding="sm" variant="glass" className="text-center">
            <div className="text-xs text-pixel-gray mb-1">累计矿石</div>
            <div className="text-2xl font-bold text-yellow-500">{totalOres}</div>
          </PixelCard>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-white/50" />
          <span className="text-xs text-white/50">显示:</span>
          {(['all', 'normal', 'timed'] as const).map((type) => (
            <PixelButton
              key={type}
              variant={levelTypeFilter === type ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setLevelTypeFilter(type);
                const firstLevel = levels.find((l) => type === 'all' || l.type === type);
                if (firstLevel) setSelectedLevel(firstLevel.id);
              }}
            >
              {type === 'all' ? '全部' : type === 'normal' ? '普通' : (
                <>
                  <Clock className="w-3 h-3" />
                  限时
                </>
              )}
            </PixelButton>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <PixelButton
            variant={activeTab === 'scores' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('scores')}
            icon={<Trophy size={18} />}
            className="flex-1"
          >
            分数排行
          </PixelButton>
          <PixelButton
            variant={activeTab === 'replays' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('replays')}
            icon={<Play size={18} />}
            className="flex-1"
          >
            精彩回放
          </PixelButton>
        </div>

        {activeTab === 'scores' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {levelOptions.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={cn(
                    'px-4 py-2 font-pixel text-xs whitespace-nowrap transition-all pixel-border flex items-center gap-1.5',
                    selectedLevel === level.id
                      ? 'bg-pixel-tan text-pixel-brown-dark shadow-pixel'
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                  )}
                >
                  {level.type === 'timed' && <Clock size={12} />}
                  {level.name}
                </button>
              ))}
            </div>

            <PixelCard title={
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                <span>{currentLevel?.name} - 排行榜</span>
                {currentLevel?.type === 'timed' && (
                  <PixelBadge variant="warning" size="sm">
                    限时 {currentLevel.timeLimit}秒
                  </PixelBadge>
                )}
              </div>
            }>
              {currentLevelData.length === 0 ? (
                <div className="text-center py-12 text-pixel-gray">
                  <Medal size={48} className="mx-auto mb-4 opacity-50" />
                  <p>暂无排行数据</p>
                  <p className="text-xs mt-2">完成游戏后将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentLevelData.map((entry) => (
                    <div
                      key={`${entry.levelId}-${entry.rank}`}
                      className={cn(
                        'flex items-center gap-4 p-4 pixel-border transition-all hover:scale-[1.02]',
                        getRankBg(entry.rank)
                      )}
                    >
                      <div className={cn('text-2xl font-bold w-12 text-center', getRankColor(entry.rank))}>
                        #{entry.rank}
                      </div>
                      <div className="text-4xl">{entry.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-pixel-brown-dark truncate">
                          {entry.playerName}
                        </div>
                        <div className="text-xs text-pixel-gray flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {formatDate(entry.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-pixel-red">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-pixel-gray">分</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PixelCard>

            <PixelCard title={
              <div className="flex items-center gap-2">
                <Medal className="text-pixel-blue" size={20} />
                <span>我的最佳成绩</span>
              </div>
            }>
              {Object.keys(playerBestScores).length === 0 ? (
                <div className="text-center py-8 text-pixel-gray">
                  <p>还没有游戏记录</p>
                  <p className="text-xs mt-2">快去挑战吧！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {levelOptions.map((level) => {
                    const bestScore = playerBestScores[level.id] || 0;
                    const levelMock = mockLeaderboardData[level.id] || [];
                    const levelRank = levelMock.findIndex(e => e.score < bestScore) + 1 || levelMock.length + 1;
                    return (
                      <div key={level.id} className="flex items-center gap-3 p-3 bg-pixel-cream/50 pixel-border">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-pixel-brown-dark truncate">{level.name}</div>
                            {level.type === 'timed' && (
                              <PixelBadge variant="warning" size="sm">
                                ⏱ {level.timeLimit}s
                              </PixelBadge>
                            )}
                          </div>
                          <div className="text-xs text-pixel-gray">难度 {'⭐'.repeat(level.difficulty)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-pixel-red">
                            {bestScore.toLocaleString()}
                          </div>
                          <div className="text-xs text-pixel-gray">
                            {bestScore > 0 ? `排名 #${levelRank}` : '未挑战'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PixelCard>
          </div>
        )}

        {activeTab === 'replays' && (
          <PixelCard title={
            <div className="flex items-center gap-2">
              <Play className="text-pixel-red" size={20} />
              <span>历史游戏记录</span>
              {levelTypeFilter !== 'all' && (
                <PixelBadge variant={levelTypeFilter === 'timed' ? 'warning' : 'info'} size="sm">
                  {levelTypeFilter === 'timed' ? '限时关卡' : '普通关卡'}
                </PixelBadge>
              )}
            </div>
          }>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-pixel-gray">
                <Play size={48} className="mx-auto mb-4 opacity-50" />
                <p>暂无游戏记录</p>
                <p className="text-xs mt-2">完成游戏后将显示在这里</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record, index) => {
                  const minecart = getMinecartById(record.mineCartId);
                  const isTimed = (record.levelType || 'normal') === 'timed';
                  const level = record.levelId ? levels.find(l => l.id === record.levelId) : undefined;
                  return (
                    <div
                      key={record.id}
                      className="p-4 bg-pixel-cream/50 pixel-border hover:bg-pixel-cream transition-colors cursor-pointer group"
                      onClick={() => handleViewReplay(record)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-pixel-gray/50 w-10 text-center flex-shrink-0">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-pixel-red">
                              {record.score.toLocaleString()} 分
                            </span>
                            {index === 0 && (
                              <PixelBadge variant="warning" size="sm">最高</PixelBadge>
                            )}
                            {isTimed && (
                              <PixelBadge variant="error" size="sm">
                                ⏱ 限时
                              </PixelBadge>
                            )}
                            {level && (
                              <PixelBadge variant="info" size="sm">{level.name}</PixelBadge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-pixel-gray flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(record.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Gauge size={12} />
                              {Math.floor(record.distance)}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Gem size={12} />
                              {record.oreCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Coins size={12} />
                              {record.coins}
                            </span>
                            {record.timeElapsed !== undefined && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatTime(record.timeElapsed)}
                              </span>
                            )}
                          </div>
                          {minecart && (
                            <div className="text-xs text-pixel-gray mt-1">
                              矿车: {minecart.name}
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          size={24}
                          className="text-pixel-gray group-hover:text-pixel-brown-dark transition-colors flex-shrink-0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PixelCard>
        )}
      </div>

      <PixelModal
        isOpen={showReplayModal}
        onClose={closeReplayModal}
        title={
          <div className="flex items-center gap-2">
            <Play className="text-pixel-red" size={18} />
            <span>游戏数据统计</span>
            {selectedRecord?.levelType === 'timed' && (
              <PixelBadge variant="error" size="sm">⏱ 限时关卡</PixelBadge>
            )}
          </div>
        }
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-6xl font-bold text-pixel-red mb-2">
                {selectedRecord.score.toLocaleString()}
              </div>
              <div className="text-pixel-gray">最终得分</div>
              {selectedRecord.levelId && (
                <div className="mt-2 text-xs text-white/50">
                  {levels.find(l => l.id === selectedRecord.levelId)?.name || selectedRecord.levelId}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PixelCard padding="sm" variant="glass" className="text-center">
                <Gauge size={24} className="mx-auto mb-2 text-pixel-blue" />
                <div className="text-xl font-bold text-pixel-brown-dark">
                  {Math.floor(selectedRecord.distance)}m
                </div>
                <div className="text-xs text-pixel-gray">行驶距离</div>
              </PixelCard>
              <PixelCard padding="sm" variant="glass" className="text-center">
                <Gem size={24} className="mx-auto mb-2 text-purple-500" />
                <div className="text-xl font-bold text-pixel-brown-dark">
                  {selectedRecord.oreCount}
                </div>
                <div className="text-xs text-pixel-gray">收集矿石</div>
              </PixelCard>
              <PixelCard padding="sm" variant="glass" className="text-center">
                <Coins size={24} className="mx-auto mb-2 text-yellow-500" />
                <div className="text-xl font-bold text-pixel-brown-dark">
                  {selectedRecord.coins}
                </div>
                <div className="text-xs text-pixel-gray">获得金币</div>
              </PixelCard>
              <PixelCard padding="sm" variant="glass" className="text-center">
                <Calendar size={24} className="mx-auto mb-2 text-green-500" />
                <div className="text-sm font-bold text-pixel-brown-dark pt-1">
                  {formatDate(selectedRecord.date)}
                </div>
                <div className="text-xs text-pixel-gray mt-1">游戏时间</div>
              </PixelCard>
            </div>

            {(selectedRecord.timeElapsed !== undefined || (selectedRecord.goldOreCount ?? 0) > 0 || (selectedRecord.itemsUsed ?? 0) > 0) && (
              <div className="grid grid-cols-3 gap-2">
                {selectedRecord.timeElapsed !== undefined && (
                  <PixelCard padding="sm" variant="glass" className="text-center">
                    <Clock size={20} className="mx-auto mb-1 text-red-500" />
                    <div className="text-base font-bold text-pixel-brown-dark">
                      {formatTime(selectedRecord.timeElapsed)}
                    </div>
                    <div className="text-[10px] text-pixel-gray">用时</div>
                  </PixelCard>
                )}
                {(selectedRecord.goldOreCount ?? 0) > 0 && (
                  <PixelCard padding="sm" variant="glass" className="text-center">
                    <Trophy size={20} className="mx-auto mb-1 text-amber-500" />
                    <div className="text-base font-bold text-pixel-brown-dark">
                      {selectedRecord.goldOreCount}
                    </div>
                    <div className="text-[10px] text-pixel-gray">金矿石</div>
                  </PixelCard>
                )}
                {(selectedRecord.itemsUsed ?? 0) > 0 && (
                  <PixelCard padding="sm" variant="glass" className="text-center">
                    <Trophy size={20} className="mx-auto mb-1 text-blue-500" />
                    <div className="text-base font-bold text-pixel-brown-dark">
                      {selectedRecord.itemsUsed}
                    </div>
                    <div className="text-[10px] text-pixel-gray">使用道具</div>
                  </PixelCard>
                )}
              </div>
            )}

            {getMinecartById(selectedRecord.mineCartId) && (
              <PixelCard padding="sm" variant="glass">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 pixel-border flex-shrink-0"
                    style={{ backgroundColor: getMinecartById(selectedRecord.mineCartId)?.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-pixel-brown-dark">
                      {getMinecartById(selectedRecord.mineCartId)?.name}
                    </div>
                    <div className="text-xs text-pixel-gray truncate">
                      {getMinecartById(selectedRecord.mineCartId)?.description}
                    </div>
                  </div>
                </div>
              </PixelCard>
            )}

            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                className="flex-1"
                icon={<Play size={18} />}
                onClick={closeReplayModal}
              >
                模拟回放
              </PixelButton>
              <PixelButton
                variant="primary"
                className="flex-1"
                onClick={closeReplayModal}
              >
                关闭
              </PixelButton>
            </div>
          </div>
        )}
      </PixelModal>
    </div>
  );
}
