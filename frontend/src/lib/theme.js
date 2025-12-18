import { motion } from 'framer-motion';

/**
 * Experimental: Dark Mode Theme Provider
 * Testing new dark mode implementation with system preference detection
 */

// Theme constants
export const themes = {
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#60a5fa',
      secondary: '#a78bfa',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155'
    }
  }
};

/**
 * Theme Toggle Button Component
 */
export function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
      aria-label="Toggle theme"
    >
      <motion.span
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="block text-xl"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </motion.button>
  );
}

/**
 * Get system color scheme preference
 */
export function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  const colors = themes[theme].colors;
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export default { themes, ThemeToggle, getSystemTheme, applyTheme };
