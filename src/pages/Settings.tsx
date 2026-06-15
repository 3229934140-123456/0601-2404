import { useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Monitor,
  Smartphone,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Save,
  Info,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import PixelModal from '@/components/ui/PixelModal';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { clearAll } from '@/utils/storage';
import { cn } from '@/lib/utils';

type QualityType = 'low' | 'medium' | 'high';

const qualityLabels: Record<QualityType, string> = {
  low: '低画质',
  medium: '中画质',
  high: '高画质',
};

const qualityDescriptions: Record<QualityType, string> = {
  low: '性能优先，适合低端设备',
  medium: '平衡模式，推荐使用',
  high: '最佳画质，需要较好设备',
};

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const soundVolume = useSettingsStore((state) => state.soundVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const screenShake = useSettingsStore((state) => state.screenShake);
  const particleEffects = useSettingsStore((state) => state.particleEffects);
  const pixelQuality = useSettingsStore((state) => state.pixelQuality);
  const setSoundVolume = useSettingsStore((state) => state.setSoundVolume);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const toggleScreenShake = useSettingsStore((state) => state.toggleScreenShake);
  const toggleParticleEffects = useSettingsStore((state) => state.toggleParticleEffects);
  const setPixelQuality = useSettingsStore((state) => state.setPixelQuality);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const resetPlayer = usePlayerStore((state) => state.resetPlayer);
  const playerState = usePlayerStore((state) => state);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [importFileName, setImportFileName] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const handleSaveProgress = async () => {
    try {
      showToast('进度已自动保存');
    } catch {
      showToast('保存失败，请重试');
    }
  };

  const handleResetProgress = () => {
    resetPlayer();
    resetSettings();
    clearAll();
    setShowResetModal(false);
    showToast('进度已重置');
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        version: '1.0.0',
        exportTime: Date.now(),
        player: {
          coins: playerState.coins,
          totalScore: playerState.totalScore,
          mineCarts: playerState.mineCarts,
          currentMineCartId: playerState.currentMineCartId,
          achievements: playerState.achievements,
          inventory: playerState.inventory,
          gameRecords: playerState.gameRecords,
        },
        settings: {
          soundVolume,
          musicVolume,
          screenShake,
          particleEffects,
          pixelQuality,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `minecart-save-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('数据导出成功');
    } catch {
      showToast('导出失败，请重试');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.player || !data.settings) {
        throw new Error('无效的存档文件');
      }

      if (data.player.coins !== undefined) {
        usePlayerStore.setState({
          coins: data.player.coins,
          totalScore: data.player.totalScore,
          mineCarts: data.player.mineCarts,
          currentMineCartId: data.player.currentMineCartId,
          achievements: data.player.achievements,
          inventory: data.player.inventory,
          gameRecords: data.player.gameRecords,
        });
      }

      if (data.settings.soundVolume !== undefined) {
        useSettingsStore.setState({
          soundVolume: data.settings.soundVolume,
          musicVolume: data.settings.musicVolume,
          screenShake: data.settings.screenShake,
          particleEffects: data.settings.particleEffects,
          pixelQuality: data.settings.pixelQuality,
        });
      }

      showToast('数据导入成功');
    } catch {
      showToast('导入失败，文件格式错误');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ToggleSwitch = ({
    enabled,
    onToggle,
    label,
    icon,
  }: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 bg-pixel-cream/50 pixel-border">
      <div className="flex items-center gap-3">
        <div className="text-pixel-brown-dark">{icon}</div>
        <span className="font-pixel text-sm text-pixel-brown-dark">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'relative w-14 h-8 pixel-border transition-colors duration-200',
          enabled ? 'bg-green-500' : 'bg-stone-400'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-5 h-5 bg-white pixel-border transition-all duration-200',
            enabled ? 'left-7' : 'left-1'
          )}
        />
      </button>
    </div>
  );

  const SliderControl = ({
    label,
    value,
    onChange,
    icon,
    muteIcon,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
    muteIcon: React.ReactNode;
  }) => (
    <div className="p-4 bg-pixel-cream/50 pixel-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-pixel-brown-dark">{value === 0 ? muteIcon : icon}</div>
          <span className="font-pixel text-sm text-pixel-brown-dark">{label}</span>
        </div>
        <span className="font-pixel text-sm text-pixel-red">{Math.round(value * 100)}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 appearance-none bg-stone-300 pixel-border cursor-pointer"
          style={{
            background: `linear-gradient(to right, #E74C3C 0%, #E74C3C ${value * 100}%, #CBD5E1 ${value * 100}%, #CBD5E1 100%)`,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900">
      <PageHeader title="设置" showBack showCoins />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <PixelCard
          title={
            <div className="flex items-center gap-2">
              <Volume2 className="text-pixel-blue" size={20} />
              <span>音效设置</span>
            </div>
          }
        >
          <div className="space-y-4">
            <SliderControl
              label="背景音乐"
              value={musicVolume}
              onChange={setMusicVolume}
              icon={<Music size={20} />}
              muteIcon={<VolumeX size={20} />}
            />
            <SliderControl
              label="音效音量"
              value={soundVolume}
              onChange={setSoundVolume}
              icon={<Volume2 size={20} />}
              muteIcon={<VolumeX size={20} />}
            />
          </div>
        </PixelCard>

        <PixelCard
          title={
            <div className="flex items-center gap-2">
              <Monitor className="text-purple-500" size={20} />
              <span>画面设置</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-pixel-cream/50 pixel-border">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="text-pixel-brown-dark" size={20} />
                <span className="font-pixel text-sm text-pixel-brown-dark">像素画质</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as QualityType[]).map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setPixelQuality(quality)}
                    className={cn(
                      'p-3 pixel-border transition-all text-center',
                      pixelQuality === quality
                        ? 'bg-pixel-tan text-pixel-brown-dark shadow-pixel'
                        : 'bg-stone-200 text-pixel-gray hover:bg-stone-300'
                    )}
                  >
                    <div className="font-pixel text-xs mb-1">{qualityLabels[quality]}</div>
                    <div className="text-[10px] opacity-70">{qualityDescriptions[quality]}</div>
                  </button>
                ))}
              </div>
            </div>

            <ToggleSwitch
              enabled={screenShake}
              onToggle={toggleScreenShake}
              label="屏幕震动"
              icon={<Smartphone size={20} />}
            />

            <ToggleSwitch
              enabled={particleEffects}
              onToggle={toggleParticleEffects}
              label="粒子效果"
              icon={<Sparkles size={20} />}
            />
          </div>
        </PixelCard>

        <PixelCard
          title={
            <div className="flex items-center gap-2">
              <Save className="text-green-500" size={20} />
              <span>数据管理</span>
            </div>
          }
        >
          <div className="space-y-3">
            <PixelButton
              variant="secondary"
              className="w-full justify-start"
              icon={<Save size={18} />}
              onClick={handleSaveProgress}
            >
              保存进度
            </PixelButton>

            <PixelButton
              variant="secondary"
              className="w-full justify-start"
              icon={<Download size={18} />}
              onClick={handleExportData}
            >
              导出数据
            </PixelButton>

            <div>
              <PixelButton
                variant="secondary"
                className="w-full justify-start"
                icon={<Upload size={18} />}
                onClick={handleImportClick}
              >
                导入数据
                {importFileName && (
                  <span className="ml-2 text-xs text-pixel-gray">({importFileName})</span>
                )}
              </PixelButton>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>

            <PixelButton
              variant="danger"
              className="w-full justify-start"
              icon={<RotateCcw size={18} />}
              onClick={() => setShowResetModal(true)}
            >
              重置进度
            </PixelButton>
          </div>
        </PixelCard>

        <PixelCard
          title={
            <div className="flex items-center gap-2">
              <Info className="text-pixel-brown-dark" size={20} />
              <span>关于</span>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-pixel-cream/50 pixel-border">
              <span className="font-pixel text-sm text-pixel-brown-dark">游戏版本</span>
              <span className="font-pixel text-sm text-pixel-gray">v1.0.0</span>
            </div>
            <PixelButton
              variant="secondary"
              className="w-full justify-start"
              icon={<Info size={18} />}
              onClick={() => setShowAboutModal(true)}
            >
              开发者信息
            </PixelButton>
          </div>
        </PixelCard>
      </div>

      <PixelModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-pixel-red" size={18} />
            <span>确认重置</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <AlertTriangle size={64} className="mx-auto mb-4 text-pixel-red" />
            <p className="font-pixel text-pixel-brown-dark mb-2">确定要重置所有进度吗？</p>
            <p className="font-pixel text-sm text-pixel-gray">
              此操作将清除所有游戏数据，包括金币、成就、游戏记录等，且无法恢复。
            </p>
          </div>
          <div className="flex gap-3">
            <PixelButton
              variant="secondary"
              className="flex-1"
              icon={<X size={18} />}
              onClick={() => setShowResetModal(false)}
            >
              取消
            </PixelButton>
            <PixelButton
              variant="danger"
              className="flex-1"
              icon={<Check size={18} />}
              onClick={handleResetProgress}
            >
              确认重置
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      <PixelModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Info className="text-pixel-blue" size={18} />
            <span>关于游戏</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="text-6xl mb-4">⛏️</div>
            <h3 className="font-pixel text-xl text-pixel-brown-dark mb-2">矿车大冒险</h3>
            <p className="font-pixel text-sm text-pixel-gray mb-4">
              Minecart Adventure v1.0.0
            </p>
          </div>

          <PixelCard variant="glass" padding="sm">
            <h4 className="font-pixel text-sm text-pixel-brown-dark mb-2">开发者</h4>
            <p className="font-pixel text-xs text-pixel-gray">Trae Team</p>
          </PixelCard>

          <PixelCard variant="glass" padding="sm">
            <h4 className="font-pixel text-sm text-pixel-brown-dark mb-2">游戏简介</h4>
            <p className="font-pixel text-xs text-pixel-gray leading-relaxed">
              《矿车大冒险》是一款像素风格的无尽跑酷游戏。控制矿车在危险的矿洞中穿梭，
              收集金币和矿石，躲避障碍物，挑战最高分！
            </p>
          </PixelCard>

          <PixelCard variant="glass" padding="sm">
            <h4 className="font-pixel text-sm text-pixel-brown-dark mb-2">技术栈</h4>
            <p className="font-pixel text-xs text-pixel-gray">
              React 18 + TypeScript + Zustand + Tailwind CSS
            </p>
          </PixelCard>

          <PixelButton
            variant="primary"
            className="w-full"
            onClick={() => setShowAboutModal(false)}
          >
            关闭
          </PixelButton>
        </div>
      </PixelModal>

      {showSuccessToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-pixel-slide-up">
          <div className="flex items-center gap-2 px-6 py-3 bg-pixel-brown-dark text-pixel-cream pixel-border shadow-pixel-lg">
            <Check size={20} className="text-green-400" />
            <span className="font-pixel text-sm">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
