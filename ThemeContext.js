import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      background: isDarkMode ? '#121212' : '#FFFFFF',
      text: isDarkMode ? '#FFFFFF' : '#333333',
      secondaryText: isDarkMode ? '#B0B0B0' : '#666666',
      primary: '#007AFF',
      card: isDarkMode ? '#1E1E1E' : '#F8F9FA',
      border: isDarkMode ? '#333333' : '#F0F0F0',
      error: '#FF3B30',
      success: '#34C759',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 