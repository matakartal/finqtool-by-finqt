import { StorageConfig } from '@/types';

export const storage = {
  async get<T>(key: keyof StorageConfig): Promise<T | null> {
    try {
      // Try Chrome storage first
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await new Promise<{ [key: string]: T }>((resolve) => {
          chrome.storage.local.get([key], resolve);
        });
        return result[key] || null;
      }
      // Fallback to localStorage
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  async set<T>(key: keyof StorageConfig, value: T): Promise<void> {
    try {
      // Try Chrome storage first
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [key]: value });
      }
      // Always save to localStorage as fallback
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  }
}; 