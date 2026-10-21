import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Saved choice wins; otherwise follow the OS preference
const getInitialDark = () => {
  try {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) return savedTheme === 'dark';
  } catch (e) {
    /* storage unavailable */
  }
  return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDark);

  useEffect(() => {
    try {
      localStorage.setItem('adminTheme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      /* storage unavailable */
    }
    document.documentElement.classList.toggle('dark', isDarkMode);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDarkMode ? '#121214' : '#faf7f6');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
