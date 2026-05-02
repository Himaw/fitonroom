import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { HeroUINativeProvider } from 'heroui-native/provider';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'heroui-native/styles';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ThemeModeProvider, useThemeMode } from '@/lib/theme-mode';
import '@/global.css';

function AppLayout() {
  const { resolvedTheme } = useThemeMode();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <HeroUINativeProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </HeroUINativeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function TabLayout() {
  return (
    <ThemeModeProvider>
      <AppLayout />
    </ThemeModeProvider>
  );
}
