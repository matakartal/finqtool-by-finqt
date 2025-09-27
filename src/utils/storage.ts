import { StorageConfig } from '@/types';

export const storage = {
  async get<T>(key: keyof StorageConfig): Promise<T | null> {
    try {
      // Try Chrome storage first
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await new Promise<{ [key: string]: T }>((resolve, reject) => {
          chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
        return result[key] || null;
      }
      // Fallback to localStorage
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      // Try localStorage as fallback if Chrome storage fails
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (fallbackError) {
        console.error(`Fallback localStorage get failed for ${key}:`, fallbackError);
        return null;
      }
    }
  },

  async set<T>(key: keyof StorageConfig, value: T): Promise<void> {
    try {
      // Try Chrome storage first
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
      // Always save to localStorage as fallback
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      // Try localStorage as fallback if Chrome storage fails
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (fallbackError) {
        console.error(`Fallback localStorage set failed for ${key}:`, fallbackError);
      }
    }
  },

  async remove(key: keyof StorageConfig): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      try {
        localStorage.removeItem(key);
      } catch (fallbackError) {
        console.error(`Fallback localStorage remove failed for ${key}:`, fallbackError);
      }
    }
  }
}; 