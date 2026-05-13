import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenScrollView from '@/components/screen-scroll-view';
import { AppRadii, AppShadows, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { ThemeMode, useThemeMode } from '@/lib/theme-mode';

const themeOptions: { label: string; value: ThemeMode; description: string }[] = [
  { label: 'System', value: 'system', description: 'Match your device appearance.' },
  { label: 'Light', value: 'light', description: 'Use the light Fiton Room theme.' },
  { label: 'Dark', value: 'dark', description: 'Use the dark Fiton Room theme.' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>Settings</Text>
        <Text style={[styles.title, { color: theme.text }]}>Make it yours.</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Simple controls for the first version. More privacy and notification settings will come
          later.
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>Appearance</Text>
        <View style={styles.optionList}>
          {themeOptions.map((option) => {
            const selected = mode === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => setMode(option.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected ? theme.backgroundSelected : theme.background,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: theme.text }]}>{option.label}</Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: selected ? theme.primary : theme.border,
                      backgroundColor: selected ? theme.primary : 'transparent',
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>Account</Text>
        <View style={[styles.accountBox, { backgroundColor: theme.backgroundSelected }]}>
          <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>Signed in as</Text>
          <Text numberOfLines={1} style={[styles.accountValue, { color: theme.text }]}>
            {user?.email ?? user?.id ?? 'Fiton Room user'}
          </Text>
        </View>
        <Pressable
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={[
            styles.signOutButton,
            { backgroundColor: theme.background, borderColor: theme.border },
            isSigningOut && styles.disabledButton,
          ]}>
          {isSigningOut ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={[styles.signOutText, { color: theme.text }]}>Sign out</Text>
          )}
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset + 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
  header: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    ...AppShadows.card,
    borderRadius: AppRadii.card,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  optionList: {
    gap: 10,
  },
  option: {
    alignItems: 'center',
    borderRadius: AppRadii.inner,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  radio: {
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    width: 20,
  },
  accountBox: {
    borderRadius: AppRadii.inner,
    gap: 4,
    padding: 14,
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  signOutButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.62,
  },
});
