import { useEffect, useState, useCallback } from 'react';
import { Trophy, Coins, X, Star, Gem, Zap, Shield, Crown, MapPin, Pickaxe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementNotificationProps {
  className?: string;
  name: string;
  description: string;
  icon?: string;
  reward: number;
  onClose?: () => void;
  duration?: number;
}

interface NotificationQueueItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  reward: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-6 h-6 text-yellow-400" />,
  Crown: <Crown className="w-6 h-6 text-yellow-400" />,
  Gem: <Gem className="w-6 h-6 text-cyan-400" />,
  Zap: <Zap className="w-6 h-6 text-yellow-400" />,
  Shield: <Shield className="w-6 h-6 text-blue-400" />,
  MapPin: <MapPin className="w-6 h-6 text-blue-400" />,
  Pickaxe: <Pickaxe className="w-6 h-6 text-orange-400" />,
  Star: <Star className="w-6 h-6 text-yellow-400" />,
};

function getIcon(iconName?: string): React.ReactNode {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  return <Trophy className="w-6 h-6 text-yellow-400" />;
}

const NotificationItem: React.FC<{
  notification: NotificationQueueItem;
  onClose: (id: string) => void;
  isExiting: boolean;
  duration: number;
}> = ({ notification, onClose, isExiting, duration }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };
    requestAnimationFrame(updateProgress);
  }, [duration]);

  return (
    <div
      className={cn(
        'relative w-full max-w-sm overflow-hidden',
        'transform transition-all duration-500 ease-out',
        isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      )}
    >
      <div className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/40 shadow-xl shadow-yellow-500/20 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/50 flex items-center justify-center">
                {getIcon(notification.icon)}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                  成就解锁!
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-0.5 truncate">
                {notification.name}
              </h4>
              <p className="text-sm text-white/70 mt-1 line-clamp-2">
                {notification.description}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400 font-mono">
                  +{notification.reward}
                </span>
                <span className="text-xs text-white/60">金币</span>
              </div>
            </div>

            <button
              onClick={() => onClose(notification.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

let notificationIdCounter = 0;

const generateNotificationId = (): string => {
  notificationIdCounter += 1;
  return `achievement-${Date.now()}-${notificationIdCounter}`;
};

const notificationQueue: NotificationQueueItem[] = [];
const listeners: Set<(queue: NotificationQueueItem[]) => void> = new Set();

export function showAchievementNotification(
  notification: Omit<NotificationQueueItem, 'id'>
): void {
  const newNotification: NotificationQueueItem = {
    ...notification,
    id: generateNotificationId(),
  };

  notificationQueue.push(newNotification);
  listeners.forEach((listener) => listener([...notificationQueue]));
}

// eslint-disable-next-line react-refresh/only-export-components
export function AchievementNotificationContainer({
  className,
  duration = 4000,
}: {
  className?: string;
  duration?: number;
}) {
  const [queue, setQueue] = useState<NotificationQueueItem[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const handleListener = useCallback((newQueue: NotificationQueueItem[]) => {
    setQueue(newQueue);
  }, []);

  useEffect(() => {
    listeners.add(handleListener);
    return () => {
      listeners.delete(handleListener);
    };
  }, [handleListener]);

  const closeNotification = useCallback(
    (id: string) => {
      setExitingIds((prev) => new Set([...prev, id]));

      setTimeout(() => {
        const index = notificationQueue.findIndex((n) => n.id === id);
        if (index !== -1) {
          notificationQueue.splice(index, 1);
          setQueue([...notificationQueue]);
        }
        setExitingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 500);
    },
    []
  );

  useEffect(() => {
    if (queue.length === 0) return;

    const timers = queue.map((notification) => {
      if (exitingIds.has(notification.id)) return null;
      return setTimeout(() => {
        closeNotification(notification.id);
      }, duration);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [queue, exitingIds, duration, closeNotification]);

  if (queue.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] flex flex-col gap-3',
        'pointer-events-none',
        className
      )}
    >
      {queue.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onClose={closeNotification}
            isExiting={exitingIds.has(notification.id)}
            duration={duration}
          />
        </div>
      ))}
    </div>
  );
}

export default function AchievementNotification({
  className,
  name,
  description,
  icon,
  reward,
  onClose,
  duration = 4000,
}: AchievementNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0 && !exiting) {
        requestAnimationFrame(updateProgress);
      }
    };
    requestAnimationFrame(updateProgress);
  }, [duration, exiting]);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 500);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] w-full max-w-sm',
        'pointer-events-auto',
        className
      )}
    >
      <div
        className={cn(
          'transform transition-all duration-500 ease-out',
          exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        )}
      >
        <div className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/40 shadow-xl shadow-yellow-500/20 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/50 flex items-center justify-center">
                  {getIcon(icon)}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                    成就解锁!
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mt-0.5 truncate">
                  {name}
                </h4>
                <p className="text-sm text-white/70 mt-1 line-clamp-2">
                  {description}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400 font-mono">
                    +{reward}
                  </span>
                  <span className="text-xs text-white/60">金币</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
