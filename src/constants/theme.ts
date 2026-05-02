/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#161a24',
    background: '#f6f7f5',
    backgroundElement: '#ffffff',
    backgroundSelected: '#edf4f1',
    textSecondary: '#667085',
    border: '#e2e8e2',
    primary: '#17695f',
    primaryText: '#ffffff',
    accent: '#d79b48',
    surfaceStrong: '#1f2832',
  },
  dark: {
    text: '#f5f7fa',
    background: '#0f1318',
    backgroundElement: '#191f27',
    backgroundSelected: '#22342f',
    textSecondary: '#a8b1bf',
    border: '#2b3440',
    primary: '#7bcfc0',
    primaryText: '#10131a',
    accent: '#f0b86a',
    surfaceStrong: '#07090d',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 104, android: 104, web: 104 }) ?? 104;
export const MaxContentWidth = 800;

export const AppRadii = {
  card: 20,
  control: 14,
  inner: 16,
} as const;

export const AppShadows = {
  card: {
    elevation: 3,
    shadowColor: '#101828',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
  },
} as const;
