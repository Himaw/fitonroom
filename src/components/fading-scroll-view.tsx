import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type FadingScrollViewProps = ScrollViewProps & {
  bottomFadeHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  fadeColor?: string;
  showBottomFade?: boolean;
  showTopFade?: boolean;
  topFadeHeight?: number;
};

function colorWithAlpha(color: string, alpha: number) {
  const normalized = color.replace('#', '');

  if (normalized.length === 6) {
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return alpha === 0 ? 'transparent' : color;
}

const FadingScrollView = forwardRef<ScrollView, FadingScrollViewProps>(
  (
    {
      bottomFadeHeight = 42,
      children,
      containerStyle,
      fadeColor,
      showBottomFade = true,
      showTopFade = true,
      style,
      topFadeHeight = 34,
      ...scrollProps
    },
    ref
  ) => {
    const theme = useTheme();
    const resolvedFadeColor = fadeColor ?? theme.background;
    const solidColor = colorWithAlpha(resolvedFadeColor, 1);
    const clearColor = colorWithAlpha(resolvedFadeColor, 0);

    return (
      <View style={[styles.root, containerStyle]}>
        <ScrollView
          {...scrollProps}
          ref={ref}
          scrollEventThrottle={scrollProps.scrollEventThrottle ?? 16}
          style={[styles.scrollView, style]}>
          {children}
        </ScrollView>

        {showTopFade && (
          <LinearGradient
            colors={[solidColor, clearColor]}
            pointerEvents="none"
            style={[styles.topFade, { height: topFadeHeight }]}
          />
        )}
        {showBottomFade && (
          <LinearGradient
            colors={[clearColor, solidColor]}
            pointerEvents="none"
            style={[styles.bottomFade, { height: bottomFadeHeight }]}
          />
        )}
      </View>
    );
  }
);

FadingScrollView.displayName = 'FadingScrollView';

export default FadingScrollView;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  topFade: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  bottomFade: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
});
