import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => Promise<void>;
};

const THEME_MODE_KEY = 'fitonroom.themeMode';

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

async function readStoredMode(): Promise<ThemeMode | null> {
  if (Platform.OS === 'web') {
    const storedMode = globalThis.localStorage?.getItem(THEME_MODE_KEY);
    return isThemeMode(storedMode) ? storedMode : null;
  }

  const storedMode = await SecureStore.getItemAsync(THEME_MODE_KEY);
  return isThemeMode(storedMode) ? storedMode : null;
}

async function writeStoredMode(mode: ThemeMode) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(THEME_MODE_KEY, mode);
    return;
  }

  await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
}

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    readStoredMode()
      .then((storedMode) => {
        if (storedMode) {
          setModeState(storedMode);
        }
      })
      .catch(() => undefined);
  }, []);

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await writeStoredMode(nextMode);
  };

  const resolvedTheme = mode === 'system' ? systemColorScheme === 'dark' ? 'dark' : 'light' : mode;

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode,
    }),
    [mode, resolvedTheme]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider');
  }

  return context;
}

