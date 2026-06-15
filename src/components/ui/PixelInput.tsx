import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

export interface PixelInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  error?: boolean;
  label?: string;
}

const sizeStyles: Record<NonNullable<PixelInputProps['size']>, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
};

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ type = 'text', size = 'md', icon, error = false, label, className, id, ...props }, ref) => {
    const inputId = id || `pixel-input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('w-full font-pixel', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-xs text-pixel-brown-dark pixel-text-shadow"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pixel-brown-dark/60">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'w-full font-pixel',
              'pixel-border',
              'bg-white text-pixel-brown-dark',
              'shadow-pixel-inset',
              'placeholder-pixel-gray/50',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-pixel-blue',
              'focus:shadow-pixel',
              icon && 'pl-10',
              error && 'border-pixel-red focus:ring-pixel-red',
              sizeStyles[size]
            )}
            {...props}
          />
          <div
            className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 opacity-30"
            style={{ borderColor: error ? '#E74C3C' : '#3D2914' }}
          />
          <div
            className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 opacity-30"
            style={{ borderColor: error ? '#E74C3C' : '#3D2914' }}
          />
        </div>
      </div>
    );
  }
);

PixelInput.displayName = 'PixelInput';

export default PixelInput;
