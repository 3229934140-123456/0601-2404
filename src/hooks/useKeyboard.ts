import { useEffect, useRef, useCallback } from 'react';

export type KeyName =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'w'
  | 'a'
  | 's'
  | 'd'
  | 'W'
  | 'A'
  | 'S'
  | 'D'
  | ' '
  | 'Escape'
  | 'Enter'
  | 'Shift'
  | 'Control'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0';

export interface KeyState {
  pressed: boolean;
  pressedAt: number | null;
  releasedAt: number | null;
}

export interface UseKeyboardOptions {
  preventDefault?: boolean;
  enabled?: boolean;
  target?: Window | HTMLElement | null;
}

export interface UseKeyboardResult {
  isPressed: (key: KeyName) => boolean;
  isKeyJustPressed: (key: KeyName) => boolean;
  isKeyJustReleased: (key: KeyName) => boolean;
  isCombinationPressed: (keys: KeyName[]) => boolean;
  getKeyState: (key: KeyName) => KeyState;
  pressedKeys: Set<KeyName>;
}

const DEFAULT_KEYS: KeyName[] = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'w',
  'a',
  's',
  'd',
  'W',
  'A',
  'S',
  'D',
  ' ',
  'Escape',
  'Enter',
  'Shift',
  'Control',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
];

function normalizeKey(key: string): KeyName | null {
  if (DEFAULT_KEYS.includes(key as KeyName)) {
    return key as KeyName;
  }
  return null;
}

export function useKeyboard(options: UseKeyboardOptions = {}): UseKeyboardResult {
  const { preventDefault = true, enabled = true, target = null } = options;

  const keysStateRef = useRef<Map<KeyName, KeyState>>(new Map());
  const justPressedRef = useRef<Set<KeyName>>(new Set());
  const justReleasedRef = useRef<Set<KeyName>>(new Set());
  const pressedKeysRef = useRef<Set<KeyName>>(new Set());

  const getKeyState = useCallback((key: KeyName): KeyState => {
    const state = keysStateRef.current.get(key);
    if (state) return state;
    return {
      pressed: false,
      pressedAt: null,
      releasedAt: null,
    };
  }, []);

  const isPressed = useCallback((key: KeyName): boolean => {
    return getKeyState(key).pressed;
  }, [getKeyState]);

  const isKeyJustPressed = useCallback((key: KeyName): boolean => {
    return justPressedRef.current.has(key);
  }, []);

  const isKeyJustReleased = useCallback((key: KeyName): boolean => {
    return justReleasedRef.current.has(key);
  }, []);

  const isCombinationPressed = useCallback((keys: KeyName[]): boolean => {
    return keys.every((key) => isPressed(key));
  }, [isPressed]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = normalizeKey(event.key);
      if (!key) return;

      if (preventDefault) {
        event.preventDefault();
      }

      const state = keysStateRef.current.get(key);
      if (!state || !state.pressed) {
        keysStateRef.current.set(key, {
          pressed: true,
          pressedAt: Date.now(),
          releasedAt: null,
        });
        pressedKeysRef.current.add(key);
        justPressedRef.current.add(key);
      }
    },
    [enabled, preventDefault]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = normalizeKey(event.key);
      if (!key) return;

      if (preventDefault) {
        event.preventDefault();
      }

      keysStateRef.current.set(key, {
        pressed: false,
        pressedAt: null,
        releasedAt: Date.now(),
      });
      pressedKeysRef.current.delete(key);
      justReleasedRef.current.add(key);
    },
    [enabled, preventDefault]
  );

  const resetJustStates = useCallback(() => {
    justPressedRef.current.clear();
    justReleasedRef.current.clear();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target || window;

    targetElement.addEventListener('keydown', handleKeyDown as EventListener);
    targetElement.addEventListener('keyup', handleKeyUp as EventListener);

    const resetInterval = setInterval(resetJustStates, 1000 / 60);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
      targetElement.removeEventListener('keyup', handleKeyUp as EventListener);
      clearInterval(resetInterval);
    };
  }, [enabled, target, handleKeyDown, handleKeyUp, resetJustStates]);

  return {
    isPressed,
    isKeyJustPressed,
    isKeyJustReleased,
    isCombinationPressed,
    getKeyState,
    get pressedKeys() {
      return new Set(pressedKeysRef.current);
    },
  };
}
