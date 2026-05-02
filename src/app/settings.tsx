import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRadii, AppShadows, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemeMode, useThemeMode } from '@/lib/theme-mode';

const themeOptions: { label: string; value: ThemeMode; description: string }[] = [
  { label: 'System', value: 'system', description: 'Match your device appearance.' },
  { label: 'Light', value: 'light', description: 'Use the light Fiton Room theme.' },
  { label: 'Dark', value: 'dark', description: 'Use the dark Fiton Room theme.' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
});
