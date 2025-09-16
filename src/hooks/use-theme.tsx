
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try chrome.storage first
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // This will be handled in useEffect below for async loading
      return (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Load theme from chrome.storage if available
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('theme', (result) => {
        if (result.theme === 'light' || result.theme === 'dark') {
          setTheme(result.theme);
        }
      });
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme });
    } else {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
