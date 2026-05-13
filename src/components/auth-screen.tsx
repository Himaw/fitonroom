import type { Provider } from '@supabase/supabase-js';
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import FadingScrollView from '@/components/fading-scroll-view';
import { AppRadii, AppShadows, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { authRedirectTo, createSessionFromUrl } from '@/lib/auth-session';
import { supabase } from '@/lib/supabase';
import { useThemeMode } from '@/lib/theme-mode';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'sign-in' | 'sign-up';
type PendingAction = 'email' | Provider | null;

const AuthContentPadding = 28;
const AuthFadePadding = 38;

export default function AuthScreen() {
  const theme = useTheme();
  const { resolvedTheme } = useThemeMode();
  const { isConfigured } = useAuth();
  const callbackUrl = Linking.useURL();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isDark = resolvedTheme === 'dark';
  const isSignUp = mode === 'sign-up';
  const primaryLabel = useMemo(() => (isSignUp ? 'Create account' : 'Sign in'), [isSignUp]);
  const topFadeHeight = Math.max(72, insets.top + AuthFadePadding);
  const bottomFadeHeight = Math.max(64, insets.bottom + AuthFadePadding);

  useEffect(() => {
    if (!callbackUrl || !isConfigured) {
      return;
    }

    createSessionFromUrl(callbackUrl)
      .then((session) => {
        if (session) {
          router.replace('/');
        }
      })
      .catch((error: Error) => setErrorMessage(error.message));
  }, [callbackUrl, isConfigured]);

  const resetFeedback = () => {
    setErrorMessage('');
    setMessage('');
  };

  const submitEmailAuth = async () => {
    if (!isConfigured) {
      setErrorMessage('Add your Supabase URL and key before signing in.');
      return;
    }

    resetFeedback();
    setPendingAction('email');

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim() || undefined,
            },
            emailRedirectTo: authRedirectTo,
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setMessage('Check your inbox to confirm your email, then come back to Fiton Room.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setPendingAction(null);
    }
  };

  const submitOAuth = async (provider: Provider) => {
    if (!isConfigured) {
      setErrorMessage('Add your Supabase URL and key before signing in.');
      return;
    }

    resetFeedback();
    setPendingAction(provider);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authRedirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.url) {
        throw new Error('Supabase did not return an OAuth URL.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo);

      if (result.type === 'success') {
        const session = await createSessionFromUrl(result.url);

        if (session) {
          router.replace('/');
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'OAuth sign in failed.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}>
        <FadingScrollView
          alwaysBounceVertical
          bottomFadeHeight={bottomFadeHeight}
          bounces
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + AuthContentPadding,
              paddingTop: insets.top + AuthContentPadding,
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          decelerationRate="fast"
          fadeColor={theme.background}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
          scrollsToTop
          topFadeHeight={topFadeHeight}>
          <View style={styles.authContent}>
            <View style={styles.header}>
              <Text style={[styles.brand, { color: theme.primary }]}>FITON ROOM</Text>
              <Text style={[styles.title, { color: theme.text }]}>Try on outfits before you buy.</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Join in, add clothing screenshots or product links, and generate realistic virtual
                fitons.
              </Text>
            </View>

            <BlurView
              blurMethod="dimezisBlurViewSdk31Plus"
              intensity={78}
              tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
              style={[
                styles.panel,
                styles.webGlass,
                {
                  backgroundColor: isDark ? 'rgba(25, 31, 39, 0.72)' : 'rgba(255, 255, 255, 0.62)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.86)',
                },
              ]}>
              <View
                pointerEvents="none"
                style={[
                  styles.innerStroke,
                  { borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.76)' },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.topHighlight,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.84)' },
                ]}
              />

              {!isConfigured && (
                <View
                  style={[
                    styles.setupNotice,
                    {
                      backgroundColor: isDark ? 'rgba(34, 52, 47, 0.72)' : 'rgba(237, 244, 241, 0.72)',
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.setupTitle, { color: theme.text }]}>Supabase is not set up</Text>
                  <Text style={[styles.setupText, { color: theme.textSecondary }]}>
                    Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY to your env file, then
                    restart Expo.
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.segmentedControl,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(22, 26, 36, 0.06)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.75)',
                  },
                ]}>
                {(['sign-in', 'sign-up'] as AuthMode[]).map((item) => {
                  const selected = mode === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        resetFeedback();
                        setMode(item);
                      }}
                      style={[
                        styles.segment,
                        selected && {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.92)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 1)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.segmentText,
                          { color: selected ? theme.text : theme.textSecondary },
                        ]}>
                        {item === 'sign-in' ? 'Sign in' : 'Sign up'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {isSignUp && (
                <TextInput
                  autoCapitalize="words"
                  autoComplete="name"
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor={theme.textSecondary}
                  showSoftInputOnFocus
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(15, 19, 24, 0.52)' : 'rgba(255, 255, 255, 0.72)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.92)',
                      color: theme.text,
                    },
                  ]}
                  value={fullName}
                />
              )}

              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                inputMode="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                showSoftInputOnFocus
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? 'rgba(15, 19, 24, 0.52)' : 'rgba(255, 255, 255, 0.72)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.92)',
                    color: theme.text,
                  },
                ]}
                value={email}
              />

              <TextInput
                autoCapitalize="none"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                autoCorrect={false}
                importantForAutofill="yes"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                showSoftInputOnFocus
                spellCheck={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? 'rgba(15, 19, 24, 0.52)' : 'rgba(255, 255, 255, 0.72)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.92)',
                    color: theme.text,
                  },
                ]}
                textContentType={isSignUp ? 'newPassword' : 'password'}
                value={password}
              />

              {!!errorMessage && (
                <Text style={[styles.feedbackText, { color: '#c2410c' }]}>{errorMessage}</Text>
              )}
              {!!message && <Text style={[styles.feedbackText, { color: theme.primary }]}>{message}</Text>}

              <Pressable
                disabled={pendingAction !== null}
                onPress={submitEmailAuth}
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.primary, shadowColor: theme.primary },
                  pendingAction !== null && styles.disabledButton,
                ]}>
                {pendingAction === 'email' ? (
                  <ActivityIndicator color={theme.primaryText} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
                    {primaryLabel}
                  </Text>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <OAuthButton
                disabled={pendingAction !== null}
                label="Continue with Google"
                onPress={() => submitOAuth('google')}
                pending={pendingAction === 'google'}
                provider="google"
              />
              <OAuthButton
                disabled={pendingAction !== null}
                label="Continue with Apple"
                onPress={() => submitOAuth('apple')}
                pending={pendingAction === 'apple'}
                provider="apple"
              />
            </BlurView>
          </View>
        </FadingScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function OAuthButton({
  disabled,
  label,
  onPress,
  pending,
  provider,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  pending: boolean;
  provider: 'apple' | 'google';
}) {
  const theme = useTheme();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.oauthButton,
        {
          backgroundColor: isDark ? 'rgba(15, 19, 24, 0.48)' : 'rgba(255, 255, 255, 0.74)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(255, 255, 255, 0.92)',
        },
        disabled && styles.disabledButton,
      ]}>
      <View style={styles.oauthContent}>
        <View
          style={[
            styles.oauthMarker,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.94)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(22, 26, 36, 0.08)',
            },
          ]}>
          {provider === 'google' ? (
            <GoogleIcon size={19} />
          ) : (
            <AppleIcon color={theme.text} size={20} />
          )}
        </View>
        <Text style={[styles.oauthButtonText, { color: theme.text }]}>{label}</Text>
      </View>
      <View style={styles.oauthSpinner}>
        {pending && <ActivityIndicator color={theme.primary} />}
      </View>
    </Pressable>
  );
}

function GoogleIcon({ size }: { size: number }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.8 15.25 3.52 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill={color}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  authContent: {
    gap: 22,
    maxWidth: Math.min(MaxContentWidth, 540),
    width: '100%',
  },
  header: {
    gap: 10,
  },
  brand: {
    fontSize: 18,
    fontWeight: '900',
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
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
    padding: 18,
  },
  webGlass: {
    backdropFilter: 'blur(28px) saturate(185%)',
    WebkitBackdropFilter: 'blur(28px) saturate(185%)',
  } as object,
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
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
  setupNotice: {
    borderRadius: AppRadii.inner,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  setupTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  setupText: {
    fontSize: 13,
    lineHeight: 19,
  },
  segmentedControl: {
    alignSelf: 'center',
    borderRadius: AppRadii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    maxWidth: 280,
    padding: 4,
    width: '100%',
  },
  segment: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    borderRadius: AppRadii.control,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.62,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  oauthButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 14,
    position: 'relative',
  },
  oauthContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  oauthMarker: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  oauthSpinner: {
    alignItems: 'center',
    position: 'absolute',
    right: 14,
  },
});
