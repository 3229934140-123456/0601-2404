import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface BackgroundAnimationProps {
  className?: string;
  speed?: number;
}

export default function BackgroundAnimation({
  className,
  speed = 1,
}: BackgroundAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const clientWidth = canvasRef.current.parentElement.clientWidth;
        const clientHeight = canvasRef.current.parentElement.clientHeight;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const trackCount = 3;
    const trackWidth = dimensions.width / trackCount;
    let scrollOffset = 0;

    const drawPixelRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    };

    const drawMinecart = (x: number, y: number, scale: number) => {
      const s = scale;
      
      drawPixelRect(x + 8 * s, y, 16 * s, 4 * s, '#8B4513');
      drawPixelRect(x + 4 * s, y + 4 * s, 24 * s, 12 * s, '#A0522D');
      drawPixelRect(x, y + 8 * s, 32 * s, 12 * s, '#8B4513');
      
      drawPixelRect(x + 4 * s, y + 20 * s, 6 * s, 6 * s, '#2F2F2F');
      drawPixelRect(x + 22 * s, y + 20 * s, 6 * s, 6 * s, '#2F2F2F');
      
      drawPixelRect(x + 12 * s, y + 10 * s, 8 * s, 8 * s, '#654321');
    };

    const drawSupportBeam = (x: number, y: number, width: number) => {
      drawPixelRect(x, y, width, 8, '#5C4033');
      drawPixelRect(x + 4, y + 8, 4, 20, '#4A3728');
      drawPixelRect(x + width - 8, y + 8, 4, 20, '#4A3728');
    };

    const drawOre = (x: number, y: number, size: number, color: string) => {
      drawPixelRect(x + size / 4, y, size / 2, size, color);
      drawPixelRect(x, y + size / 4, size, size / 2, color);
      drawPixelRect(x + size / 6, y + size / 6, size * 2 / 3, size * 2 / 3, color);
    };

    const drawBat = (x: number, y: number, scale: number) => {
      const s = scale;
      drawPixelRect(x + 4 * s, y + 2 * s, 8 * s, 4 * s, '#1a1a2e');
      drawPixelRect(x, y + 4 * s, 16 * s, 2 * s, '#16213e');
      drawPixelRect(x + 2 * s, y + 6 * s, 12 * s, 2 * s, '#0f3460');
    };

    const animate = () => {
      scrollOffset -= 2 * speed;
      if (scrollOffset <= -64) {
        scrollOffset = 0;
      }

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, '#2d1f3d');
      gradient.addColorStop(1, '#1a1a2e');
      gradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      for (let y = scrollOffset % 32; y < dimensions.height; y += 32) {
        for (let x = 0; x < dimensions.width; x += 64) {
          const offsetX = (Math.floor(y / 32) % 2) * 32;
          drawPixelRect(x + offsetX, y, 4, 4, '#2a2a4a');
        }
      }

      for (let i = 0; i < trackCount + 1; i++) {
        const trackX = i * trackWidth;
        drawPixelRect(trackX + trackWidth / 2 - 2, 0, 4, dimensions.height, '#4a4a6a');
      }

      for (let y = scrollOffset; y < dimensions.height + 64; y += 64) {
        for (let i = 0; i < trackCount; i++) {
          const trackX = i * trackWidth;
          drawPixelRect(trackX + 16, y, trackWidth - 32, 8, '#5C4033');
        }
      }

      for (let y = scrollOffset * 0.5; y < dimensions.height + 200; y += 200) {
        drawSupportBeam(0, y, dimensions.width);
      }

      for (let y = scrollOffset * 1.5; y < dimensions.height + 100; y += 100) {
        const randomX = (Math.sin(y * 0.01) * 100 + 200) % dimensions.width;
        if (randomX > 50 && randomX < dimensions.width - 50) {
          drawOre(randomX, y, 16, '#FFD700');
        }
      }

      for (let y = scrollOffset * 0.8; y < dimensions.height + 150; y += 150) {
        const randomX = (Math.cos(y * 0.02) * 150 + 400) % dimensions.width;
        if (randomX > 50 && randomX < dimensions.width - 50) {
          drawBat(randomX, y, 3);
        }
      }

      const minecartY = dimensions.height - 100 + Math.sin(Date.now() * 0.002) * 10;
      for (let i = 0; i < 2; i++) {
        drawMinecart(
          i * trackWidth + trackWidth / 2 - 16 * 2,
          minecartY + scrollOffset * 0.3,
          2
        );
      }

      for (let i = 0; i < 5; i++) {
        const sparkleX = (i * 250 + Date.now() * 0.02) % dimensions.width;
        const sparkleY = 100 + i * 80;
        const alpha = 0.3 + Math.sin(Date.now() * 0.005 + i) * 0.3;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillRect(sparkleX, sparkleY, 2, 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions.width, dimensions.height, speed]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-900/50"
        aria-hidden="true"
      />
    </div>
  );
}
