import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'heroui-native/styles';
import AuthScreen from '@/components/auth-screen';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeModeProvider, useThemeMode } from '@/lib/theme-mode';
import '@/global.css';

function AuthGate() {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loadingRoot, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Opening Fiton Room</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <AppTabs />;
}

function AppLayout() {
  const { resolvedTheme } = useThemeMode();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar animated style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <HeroUINativeProvider>
          <AuthProvider>
            <AnimatedSplashOverlay />
            <AuthGate />
          </AuthProvider>
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

const styles = StyleSheet.create({
  loadingRoot: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
