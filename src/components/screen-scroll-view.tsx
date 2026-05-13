import type { ReactNode } from 'react';
import {
  type ScrollViewProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import FadingScrollView from '@/components/fading-scroll-view';
import { useTheme } from '@/hooks/use-theme';

type ScreenScrollViewProps = ScrollViewProps & {
  bottomFadeHeight?: number;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  topFadeHeight?: number;
};

const TopContentPadding = 24;
const TopFadePadding = 38;

export default function ScreenScrollView({
  bottomFadeHeight = 64,
  children,
  contentContainerStyle,
  topFadeHeight,
  ...scrollProps
}: ScreenScrollViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const resolvedTopFadeHeight = topFadeHeight ?? Math.max(72, insets.top + TopFadePadding);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FadingScrollView
        {...scrollProps}
        bottomFadeHeight={bottomFadeHeight}
        contentContainerStyle={[
          contentContainerStyle,
          { paddingTop: insets.top + TopContentPadding },
        ]}
        fadeColor={theme.background}
        topFadeHeight={resolvedTopFadeHeight}>
        {children}
      </FadingScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
