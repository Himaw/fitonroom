import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim() ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const secureStorage = {
  getItem: async (key: string) => {
    if (isBrowser) {
      return window.localStorage.getItem(key);
    }

    if (SecureStore?.getItemAsync) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {}
    }

    return null;
  },
  setItem: async (key: string, value: string) => {
    if (isBrowser) {
      window.localStorage.setItem(key, value);
      return;
    }

    if (SecureStore?.setItemAsync) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch {}
    }
  },
  removeItem: async (key: string) => {
    if (isBrowser) {
      window.localStorage.removeItem(key);
      return;
    }

    if (SecureStore?.deleteItemAsync) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {}
    }
  },
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-supabase-key',
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: secureStorage,
    },
  }
);
