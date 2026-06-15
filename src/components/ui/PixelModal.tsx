import { cn } from '@/lib/utils';
import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
}

export default function PixelModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeOnOverlayClick = true,
}: PixelModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'absolute inset-0 bg-pixel-dark/70 backdrop-blur-sm',
          'animate-pixel-fade-in'
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4',
          'animate-pixel-slide-up'
        )}
      >
        <div
          className={cn(
            'font-pixel',
            'pixel-border',
            'bg-pixel-cream shadow-pixel-lg',
            'relative overflow-hidden',
            className
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-pixel-tan border-b-4 border-pixel-brown-dark" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-pixel-tan border-t-4 border-pixel-brown-dark" />
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-pixel-tan border-r-4 border-pixel-brown-dark" />
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-pixel-tan border-l-4 border-pixel-brown-dark" />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-4 border-pixel-brown-dark">
              {title && (
                <h2 className="text-pixel-brown-dark text-sm pixel-text-shadow">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'pixel-border-sm bg-pixel-red text-white',
                  'p-1.5 shadow-pixel-sm',
                  'hover:bg-pixel-red-light transition-colors',
                  'active:translate-y-0.5 active:shadow-none'
                )}
              >
                <X size={16} />
              </button>
            </div>
            <div className="relative z-10 text-pixel-brown-dark">
              {children}
            </div>
          </div>

          <div className="absolute top-3 left-3 w-4 h-4 border-t-4 border-l-4 border-pixel-brown-dark/30" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-4 border-r-4 border-pixel-brown-dark/30" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-4 border-l-4 border-pixel-brown-dark/30" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-4 border-r-4 border-pixel-brown-dark/30" />
        </div>
      </div>
    </div>
  );
}
