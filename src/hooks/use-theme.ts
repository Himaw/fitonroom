import { Colors } from '@/constants/theme';
import { useThemeMode } from '@/lib/theme-mode';

export function useTheme() {
  const { resolvedTheme } = useThemeMode();

  return Colors[resolvedTheme];
}
