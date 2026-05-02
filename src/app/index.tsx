import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStoredBodyPhotos } from '@/lib/body-photo-store';
import { getOrCreateDeviceInstallId } from '@/lib/device-install-id';

type ProductPhoto = {
  id: string;
  uri: string;
};

export default function FitonScreen() {
  const theme = useTheme();
  const [deviceInstallId, setDeviceInstallId] = useState<string>('Preparing device history...');
  const [hasBodyPhotos, setHasBodyPhotos] = useState(false);
  const [productPhotos, setProductPhotos] = useState<ProductPhoto[]>([]);

  useEffect(() => {
    getOrCreateDeviceInstallId()
      .then((installId) => setDeviceInstallId(`${installId.slice(0, 8)}...${installId.slice(-4)}`))
      .catch(() => setDeviceInstallId('Device history unavailable'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getStoredBodyPhotos()
        .then((photos) => setHasBodyPhotos(photos.length > 0))
        .catch(() => setHasBodyPhotos(false));
    }, [])
  );

  const pickProductPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      quality: 0.9,
      selectionLimit: 3,
    });

    if (result.canceled) {
      return;
    }

    setProductPhotos(
      result.assets.slice(0, 3).map((asset) => ({
        uri: asset.uri,
        id: asset.assetId ?? asset.uri,
      }))
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: theme.primary }]}>Fiton Room</Text>
          <Text style={[styles.title, { color: theme.text }]}>Create a quick fiton.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Upload a clothing screenshot or product photo, or paste a product URL to start.
          </Text>
        </View>

        {!hasBodyPhotos && (
          <View
            style={[
              styles.setupPrompt,
              { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
            ]}>
            <Text style={[styles.setupTitle, { color: theme.text }]}>Set up body photos first</Text>
            <Text style={[styles.setupText, { color: theme.textSecondary }]}>
              Fiton Room needs 1-3 full-body photos before generating try-ons.
            </Text>
            <Pressable
              onPress={() => router.push('/setup')}
              style={[styles.setupButton, { backgroundColor: theme.primary }]}>
              <Text style={[styles.setupButtonText, { color: theme.primaryText }]}>
                Go to setup
              </Text>
            </Pressable>
          </View>
        )}

        <View
          style={[
            styles.panel,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <Text style={[styles.panelLabel, { color: theme.primary }]}>Clothing input</Text>

          <Pressable
            onPress={pickProductPhotos}
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
              Upload clothing photos or screenshots
            </Text>
          </Pressable>

          {productPhotos.length > 0 && (
            <View style={styles.productGrid}>
              {productPhotos.map((photo) => (
                <Image key={photo.id} source={{ uri: photo.uri }} style={styles.productPreview} />
              ))}
            </View>
          )}

          <View style={[styles.urlBox, { borderColor: theme.border }]}>
            <TextInput
              placeholder="Paste clothing product URL"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              inputMode="url"
              style={[styles.urlInput, { color: theme.text }]}
            />
            <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Add URL</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: theme.surfaceStrong, borderColor: theme.border },
          ]}>
          <Text style={[styles.statusLabel, { color: theme.accent }]}>Device history</Text>
          <Text style={styles.statusTitle}>No login required for v1</Text>
          <Text style={styles.statusText}>
            Fitons are saved to this app install: {deviceInstallId}
          </Text>
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
    paddingBottom: BottomTabInset + 36,
    paddingHorizontal: 22,
    paddingTop: 26,
    width: '100%',
  },
  header: {
    gap: 10,
    paddingTop: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 43,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
  },
  setupPrompt: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  setupText: {
    fontSize: 15,
    lineHeight: 22,
  },
  setupButton: {
    alignItems: 'center',
    borderRadius: 13,
    marginTop: 4,
    paddingVertical: 13,
  },
  setupButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  productGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  productPreview: {
    aspectRatio: 1,
    borderRadius: 12,
    flex: 1,
    maxHeight: 110,
  },
  urlBox: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  urlInput: {
    fontSize: 16,
    minHeight: 44,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  statusText: {
    color: '#d8dde7',
    fontSize: 15,
    lineHeight: 22,
  },
});

