import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showScanlines?: boolean;
  showPixelBorder?: boolean;
}

export default function MainLayout({
  children,
  className,
  showScanlines = true,
  showPixelBorder = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-stone-950 flex items-center justify-center p-4 overflow-hidden">
      <div
        className={cn(
          'relative w-full max-w-[1280px] aspect-video',
          showPixelBorder && 'pixel-border',
          className
        )}
      >
        <div className="absolute inset-0 bg-stone-900 overflow-hidden">
          {children}
        </div>

        {showScanlines && (
          <div
            className="absolute inset-0 pointer-events-none z-50 scanlines"
            aria-hidden="true"
          />
        )}

        {showPixelBorder && (
          <>
            <div
              className="absolute inset-0 pointer-events-none z-40 pixel-corner-tl"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none z-40 pixel-corner-tr"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none z-40 pixel-corner-bl"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none z-40 pixel-corner-br"
              aria-hidden="true"
            />
          </>
        )}
      </div>

      <style>{`
        .pixel-border {
          box-shadow:
            0 -4px 0 0 #fbbf24,
            0 4px 0 0 #fbbf24,
            -4px 0 0 0 #fbbf24,
            4px 0 0 0 #fbbf24,
            0 -8px 0 0 #92400e,
            0 8px 0 0 #92400e,
            -8px 0 0 0 #92400e,
            8px 0 0 0 #92400e,
            inset 0 0 0 4px rgba(0, 0, 0, 0.3);
        }

        .scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: scanline-flicker 0.15s infinite;
        }

        @keyframes scanline-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        .pixel-corner-tl,
        .pixel-corner-tr,
        .pixel-corner-bl,
        .pixel-corner-br {
          position: absolute;
          width: 16px;
          height: 16px;
          background: #fbbf24;
        }

        .pixel-corner-tl {
          top: -8px;
          left: -8px;
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        .pixel-corner-tr {
          top: -8px;
          right: -8px;
          clip-path: polygon(100% 0, 100% 100%, 0 0);
        }

        .pixel-corner-bl {
          bottom: -8px;
          left: -8px;
          clip-path: polygon(0 0, 100% 100%, 0 100%);
        }

        .pixel-corner-br {
          bottom: -8px;
          right: -8px;
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }
      `}</style>
    </div>
  );
}
