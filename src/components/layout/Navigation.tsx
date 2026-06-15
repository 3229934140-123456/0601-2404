import { Home, ShoppingCart, Trophy, Settings, Play } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface NavigationProps {
  className?: string;
}

const navItems: NavItem[] = [
  {
    to: '/',
    icon: <Home className="w-6 h-6" />,
    label: '主页',
  },
  {
    to: '/shop',
    icon: <ShoppingCart className="w-6 h-6" />,
    label: '商店',
  },
  {
    to: '/levels',
    icon: <Play className="w-6 h-6" />,
    label: '关卡',
  },
  {
    to: '/achievements',
    icon: <Trophy className="w-6 h-6" />,
    label: '成就',
  },
  {
    to: '/settings',
    icon: <Settings className="w-6 h-6" />,
    label: '设置',
  },
];

export default function Navigation({ className }: NavigationProps) {
  return (
    <nav
      className={cn(
        'w-full px-4 py-3 bg-stone-800/90 border-t-4 border-amber-600 flex items-center justify-around gap-2',
        className
      )}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'nav-item flex flex-col items-center gap-1 px-4 py-2 transition-all duration-150',
              'border-4 border-transparent',
              isActive
                ? 'bg-amber-700 border-amber-500 text-amber-100'
                : 'bg-stone-700 hover:bg-stone-600 border-stone-600 hover:border-amber-600 text-stone-300 hover:text-amber-400'
            )
          }
        >
          {item.icon}
          <span className="pixel-text text-xs font-bold tracking-wide">
            {item.label}
          </span>
        </NavLink>
      ))}

      <style>{`
        .nav-item {
          clip-path: polygon(
            0 4px, 4px 4px, 4px 0,
            calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
            100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
            calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
            0 calc(100% - 4px)
          );
          min-width: 70px;
        }

        .pixel-text {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
          image-rendering: pixelated;
        }
      `}</style>
    </nav>
  );
}
