import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

// Store theme in localStorage to persist between sessions
const THEME_KEY = 'finqt-theme';

// Get system theme preference
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
  return savedTheme || getSystemTheme();
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Memoize the toggle function to prevent recreating on each render
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, newTheme);
      return newTheme;
    });
  }, []);

  // Apply theme to document only when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { theme, toggleTheme };
}; 