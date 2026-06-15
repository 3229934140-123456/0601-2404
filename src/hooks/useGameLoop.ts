import { useEffect, useRef, useCallback } from 'react';

export interface UseGameLoopOptions {
  fixedTimeStep?: number;
  maxUpdatesPerFrame?: number;
  autoStart?: boolean;
}

export interface UseGameLoopResult {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isRunning: boolean;
  isPaused: boolean;
}

export function useGameLoop(
  onUpdate: (deltaTime: number) => void,
  onRender: () => void,
  options: UseGameLoopOptions = {}
): UseGameLoopResult {
  const {
    fixedTimeStep = 1000 / 60,
    maxUpdatesPerFrame = 5,
    autoStart = true,
  } = options;

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const onRenderRef = useRef(onRender);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onRenderRef.current = onRender;
  }, [onRender]);

  const loop = useCallback(
    (currentTime: number) => {
      if (!isRunningRef.current || isPausedRef.current) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = currentTime - previousTimeRef.current;
      previousTimeRef.current = currentTime;

      accumulatorRef.current += deltaTime;

      let updates = 0;
      while (accumulatorRef.current >= fixedTimeStep && updates < maxUpdatesPerFrame) {
        onUpdateRef.current(fixedTimeStep);
        accumulatorRef.current -= fixedTimeStep;
        updates++;
      }

      onRenderRef.current();

      requestRef.current = requestAnimationFrame(loop);
    },
    [fixedTimeStep, maxUpdatesPerFrame]
  );

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    isPausedRef.current = false;
    previousTimeRef.current = performance.now();
    accumulatorRef.current = 0;
    requestRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    if (!isRunningRef.current || !isPausedRef.current) return;
    isPausedRef.current = false;
    previousTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    start,
    stop,
    pause,
    resume,
    get isRunning() {
      return isRunningRef.current;
    },
    get isPaused() {
      return isPausedRef.current;
    },
  };
}
