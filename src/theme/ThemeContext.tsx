import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgInput: string;
  border: string;
  borderCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentGold: string;
  accentRose: string;
  topBarBg: string;
  topBarBorder: string;
  sidebarBg: string;
  sidebarHeader: string;
  sidebarItemActive: string;
  chipBg: string;
  chipActiveBg: string;
  chipBorder: string;
  chipText: string;
  statusBarStyle: 'light-content' | 'dark-content';
  isDark: boolean;
}

export const darkColors: ThemeColors = {
  bgPrimary: '#1a0b14',
  bgSecondary: '#26121e',
  bgCard: '#26121e',
  bgInput: '#1a0b14',
  border: '#381c2c',
  borderCard: '#381c2c',
  textPrimary: '#ffffff',
  textSecondary: '#eeacc1',
  textMuted: '#94a3b8',
  accentGold: '#d4af37',
  accentRose: '#f43f5e',
  topBarBg: '#26121e',
  topBarBorder: '#381c2c',
  sidebarBg: '#1a0b14',
  sidebarHeader: '#26121e',
  sidebarItemActive: '#381c2c',
  chipBg: '#1a0b14',
  chipActiveBg: '#381c2c',
  chipBorder: '#381c2c',
  chipText: '#aaa',
  statusBarStyle: 'light-content',
  isDark: true,
};

export const lightColors: ThemeColors = {
  bgPrimary: '#fdf5f8',
  bgSecondary: '#ffffff',
  bgCard: '#ffffff',
  bgInput: '#fff0f4',
  border: '#f3d0db',
  borderCard: '#f7d8e2',
  textPrimary: '#2d1525',
  textSecondary: '#8b2c4e',
  textMuted: '#64748b',
  accentGold: '#b8860b',
  accentRose: '#e11d48',
  topBarBg: '#ffffff',
  topBarBorder: '#f3d0db',
  sidebarBg: '#ffffff',
  sidebarHeader: '#fdf5f8',
  sidebarItemActive: '#ffebee',
  chipBg: '#fff0f4',
  chipActiveBg: '#ffebee',
  chipBorder: '#f7d8e2',
  chipText: '#666',
  statusBarStyle: 'dark-content',
  isDark: false,
};

interface ThemeContextType {
  mode: ThemeMode;
  theme: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  theme: darkColors,
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceScheme = useDeviceColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadThemePref();
  }, []);

  const loadThemePref = async () => {
    try {
      const saved = await AsyncStorage.getItem('admin_theme_mode');
      if (saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
        setModeState(saved as ThemeMode);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem('admin_theme_mode', newMode);
    } catch (e) {
      console.error(e);
    }
  };

  const activeScheme = mode === 'system' ? (deviceScheme || 'dark') : mode;
  const theme = activeScheme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
