import type { PersistStorage, StorageValue } from 'zustand/middleware';

const ENCRYPTION_KEY = 'mine-cart-game-v1';

const simpleEncrypt = (data: string): string => {
  if (typeof window === 'undefined') return data;
  
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
};

const simpleDecrypt = (encrypted: string): string => {
  if (typeof window === 'undefined') return encrypted;
  
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return encrypted;
  }
};

const rawStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;
      
      const decrypted = simpleDecrypt(item);
      return decrypted;
    } catch {
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const encrypted = simpleEncrypt(value);
      localStorage.setItem(name, encrypted);
    } catch {
      console.warn('Failed to save to localStorage');
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(name);
    } catch {
      console.warn('Failed to remove from localStorage');
    }
  },
};

export const storage = {
  getItem: async (name: string) => {
    const item = rawStorage.getItem(name);
    if (item === null) return null;
    return JSON.parse(item) as StorageValue<unknown>;
  },
  setItem: async (name: string, value: StorageValue<unknown>) => {
    rawStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    rawStorage.removeItem(name);
  },
} satisfies PersistStorage<unknown>;

export const get = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const item = await storage.getItem(key);
    if (item === null) return defaultValue;
    return item as unknown as T;
  } catch {
    return defaultValue;
  }
};

export const set = async <T>(key: string, value: T): Promise<void> => {
  try {
    await storage.setItem(key, value as StorageValue<unknown>);
  } catch {
    console.warn('Failed to save value');
  }
};

export const remove = async (key: string): Promise<void> => {
  await storage.removeItem(key);
};

export const clearAll = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.clear();
};
