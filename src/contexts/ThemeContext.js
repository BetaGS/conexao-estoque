import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);