import { BlurView } from 'expo-blur';
import type { Href } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeMode } from '@/lib/theme-mode';

type SymbolName = React.ComponentProps<typeof SymbolView>['name'];

const tabs: {
  href: Href;
  icon: SymbolName;
  label: string;
  name: string;
}[] = [
  {
    href: '/',
    icon: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
    label: 'Fiton',
    name: 'index',
  },
  {
    href: '/setup',
    icon: { ios: 'person.crop.rectangle', android: 'person', web: 'person' },
    label: 'Setup',
    name: 'setup',
  },
  {
    href: '/history',
    icon: { ios: 'clock', android: 'history', web: 'history' },
    label: 'History',
    name: 'history',
  },
  {
    href: '/settings',
    icon: { ios: 'gearshape', android: 'settings', web: 'settings' },
    label: 'Settings',
    name: 'settings',
  },
];

export default function LiquidGlassTabs() {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <GlassTabList isDark={isDark}>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={tab.label} />
            </TabTrigger>
          ))}
        </GlassTabList>
      </TabList>
    </Tabs>
  );
}

function GlassTabList({
  children,
  isDark,
  ...props
}: TabListProps & { isDark: boolean }) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <BlurView
        intensity={72}
        tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={[
          styles.glassShell,
          styles.webGlass,
          {
            backgroundColor: isDark ? 'rgba(20, 24, 33, 0.64)' : 'rgba(255, 255, 255, 0.58)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.78)',
          },
        ]}>
        <View
          pointerEvents="none"
          style={[
            styles.innerStroke,
            { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.72)' },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.topHighlight,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)' },
          ]}
        />
        <View style={styles.tabRow}>{children}</View>
      </BlurView>
      <View
        pointerEvents="none"
        style={[
          styles.shadowBloom,
          { backgroundColor: isDark ? 'rgba(112, 199, 184, 0.16)' : 'rgba(23, 107, 97, 0.11)' },
        ]}
      />
    </View>
  );
}

function TabButton({ icon, isFocused, label, ...props }: TabTriggerSlotProps & {
  icon: SymbolName;
  label: string;
}) {
  const theme = useTheme();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const activeColor = isDark ? '#e9fff9' : '#103f3a';
  const inactiveColor = isDark ? 'rgba(247, 244, 239, 0.62)' : 'rgba(22, 26, 36, 0.56)';

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonSurface,
          isFocused && {
            backgroundColor: isDark ? 'rgba(112, 199, 184, 0.18)' : 'rgba(255, 255, 255, 0.72)',
            borderColor: isDark ? 'rgba(112, 199, 184, 0.28)' : 'rgba(255, 255, 255, 0.9)',
          },
        ]}>
        <SymbolView
          name={icon}
          size={20}
          tintColor={isFocused ? activeColor : inactiveColor}
          weight={isFocused ? 'semibold' : 'regular'}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? '800' : '700',
            },
          ]}>
          {label}
        </Text>
        {isFocused && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabListContainer: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Platform.select({ ios: 12, android: 14, web: 18 }),
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'absolute',
    width: '100%',
  },
  glassShell: {
    borderRadius: 34,
    borderWidth: 1,
    elevation: 18,
    maxWidth: Math.min(MaxContentWidth, 460),
    overflow: 'hidden',
    padding: 7,
    shadowColor: '#000000',
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    width: '100%',
  },
  webGlass: {
    backdropFilter: 'blur(26px) saturate(190%)',
    WebkitBackdropFilter: 'blur(26px) saturate(190%)',
  } as object,
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1,
  },
  topHighlight: {
    borderRadius: 999,
    height: 1,
    left: 24,
    position: 'absolute',
    right: 24,
    top: 1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  tabButtonSurface: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 27,
    borderWidth: 1,
    gap: 2,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 14,
  },
  activeDot: {
    borderRadius: 2,
    height: 4,
    marginTop: 1,
    width: 4,
  },
  shadowBloom: {
    borderRadius: 34,
    bottom: Platform.select({ ios: 7, android: 9, web: 13 }),
    height: 64,
    maxWidth: Math.min(MaxContentWidth, 430),
    position: 'absolute',
    width: '78%',
    zIndex: -1,
  },
});
