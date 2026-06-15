import { useRef, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import type { Ref } from 'react';
import { cn } from '@/lib/utils';
import type { Particle } from '@/types';

export type ParticleType = 'sparkle' | 'explosion' | 'trail' | 'collect' | 'damage' | 'heal';

export interface ParticleConfig {
  type?: ParticleType;
  count?: number;
  speed?: number;
  size?: number;
  life?: number;
  color?: string;
  gravity?: number;
  airResistance?: number;
}

export interface ParticleEffectHandle {
  emit: (x: number, y: number, config?: ParticleConfig) => void;
  emitAtElement: (element: HTMLElement, config?: ParticleConfig) => void;
  clear: () => void;
}

interface ParticleEffectProps {
  className?: string;
  active?: boolean;
  maxParticles?: number;
  autoEmit?: {
    type: ParticleType;
    interval: number;
    config?: ParticleConfig;
  };
}

let particleIdCounter = 0;

const generateParticleId = (): string => {
  particleIdCounter += 1;
  return `particle-${Date.now()}-${particleIdCounter}`;
};

const defaultConfigs: Record<ParticleType, ParticleConfig> = {
  sparkle: {
    count: 8,
    speed: 100,
    size: 4,
    life: 0.6,
    color: '#ffd700',
    gravity: 200,
    airResistance: 2,
  },
  explosion: {
    count: 20,
    speed: 200,
    size: 6,
    life: 0.8,
    color: '#ff4444',
    gravity: 400,
    airResistance: 1.5,
  },
  trail: {
    count: 3,
    speed: 30,
    size: 3,
    life: 0.4,
    color: '#ffffff',
    gravity: 0,
    airResistance: 3,
  },
  collect: {
    count: 12,
    speed: 150,
    size: 5,
    life: 0.7,
    color: '#00ff88',
    gravity: 300,
    airResistance: 2,
  },
  damage: {
    count: 15,
    speed: 180,
    size: 5,
    life: 0.5,
    color: '#ff4444',
    gravity: 350,
    airResistance: 1.8,
  },
  heal: {
    count: 10,
    speed: 80,
    size: 4,
    life: 0.8,
    color: '#44ff88',
    gravity: -100,
    airResistance: 2.5,
  },
};

function createParticle(
  x: number,
  y: number,
  config: ParticleConfig
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const velocity = (config.speed ?? 100) * (0.5 + Math.random() * 0.5);
  const size = (config.size ?? 4) * (0.5 + Math.random() * 0.5);
  const life = (config.life ?? 0.5) * (0.7 + Math.random() * 0.6);

  return {
    id: generateParticleId(),
    x,
    y,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity - (config.speed ?? 100) * 0.3,
    life,
    maxLife: life,
    color: config.color ?? '#ffffff',
    size,
  };
}

const ParticleEffect = forwardRef<ParticleEffectHandle, ParticleEffectProps>(function ParticleEffect(
  { className, active = true, maxParticles = 200, autoEmit },
  ref: Ref<ParticleEffectHandle>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const autoEmitTimerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const emit = useCallback(
    (x: number, y: number, config: ParticleConfig = {}) => {
      if (!active) return;

      const type = config.type ?? 'sparkle';
      const mergedConfig = { ...defaultConfigs[type], ...config };
      const count = mergedConfig.count ?? 10;

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        if (particlesRef.current.length + newParticles.length >= maxParticles) break;
        newParticles.push(createParticle(x, y, mergedConfig));
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];
    },
    [active, maxParticles]
  );

  const emitAtElement = useCallback(
    (element: HTMLElement, config?: ParticleConfig) => {
      const rect = element.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const x = rect.left + rect.width / 2 - containerRect.left;
      const y = rect.top + rect.height / 2 - containerRect.top;

      emit(x, y, config);
    },
    [emit]
  );

  const clear = useCallback(() => {
    particlesRef.current = [];
  }, []);

  const update = useCallback(
    (deltaTime: number, config: { gravity: number; airResistance: number } = { gravity: 500, airResistance: 2 }) => {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        p.vy += config.gravity * deltaTime;
        p.vx *= 1 - config.airResistance * deltaTime;
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
    },
    []
  );

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particlesRef.current) {
        const alpha = Math.max(0, p.life / p.maxLife);
        const size = p.size * alpha;

        ctx.save();
        ctx.globalAlpha = alpha;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, p.color + '88');
        gradient.addColorStop(1, p.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);

        ctx.restore();
      }

      ctx.globalCompositeOperation = 'source-over';
    },
    []
  );

  const handleResize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    handleResize();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      update(deltaTime);
      render(ctx, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [update, render, handleResize]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (autoEmit && active) {
      autoEmitTimerRef.current = window.setInterval(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          emit(x, y, { type: autoEmit.type, ...autoEmit.config });
        }
      }, autoEmit.interval);
    }

    return () => {
      if (autoEmitTimerRef.current) {
        clearInterval(autoEmitTimerRef.current);
      }
    };
  }, [autoEmit, active, emit]);

  useImperativeHandle(
    ref,
    () => ({
      emit,
      emitAtElement,
      clear,
    }),
    [emit, emitAtElement, clear]
  );

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
});

export const ParticleBurst: React.FC<{
  x: number;
  y: number;
  type?: ParticleType;
  config?: ParticleConfig;
  onComplete?: () => void;
  className?: string;
}> = ({ x, y, type = 'sparkle', config, onComplete, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const mergedConfig = useMemo(
    () => ({ ...defaultConfigs[type], ...config }),
    [type, config]
  );

  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < (mergedConfig.count ?? 10); i++) {
      particles.push(createParticle(x, y, mergedConfig));
    }
    particlesRef.current = particles;
  }, [x, y, mergedConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const update = (deltaTime: number) => {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        p.vy += (mergedConfig.gravity ?? 500) * deltaTime;
        p.vx *= 1 - (mergedConfig.airResistance ?? 2) * deltaTime;
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particlesRef.current) {
        const alpha = Math.max(0, p.life / p.maxLife);
        const size = p.size * alpha;

        ctx.save();
        ctx.globalAlpha = alpha;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, p.color + '88');
        gradient.addColorStop(1, p.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);

        ctx.restore();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      update(deltaTime);
      render();

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(gameLoop);
      } else {
        onComplete?.();
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mergedConfig, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 pointer-events-none z-50', className)}
    />
  );
};

export default ParticleEffect;
