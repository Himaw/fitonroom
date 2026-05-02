import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRadii, AppShadows, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStoredBodyPhotos, saveStoredBodyPhotos } from '@/lib/body-photo-store';

type BodyPhoto = {
  uri: string;
  id: string;
};

const setupTips = [
  'Use a clear full-body photo from head to feet.',
  'Stand straight with arms slightly away from your body.',
  'Choose bright, even lighting with a plain background.',
  'Avoid mirrors, heavy filters, and loose outerwear.',
];

export default function SetupScreen() {
  const theme = useTheme();
  const [bodyPhotos, setBodyPhotos] = useState<BodyPhoto[]>([]);

  useEffect(() => {
    getStoredBodyPhotos().then(setBodyPhotos).catch(() => undefined);
  }, []);

  const pickBodyPhotos = async () => {
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

    const nextPhotos = result.assets.slice(0, 3).map((asset) => ({
      uri: asset.uri,
      id: asset.assetId ?? asset.uri,
    }));

    setBodyPhotos(nextPhotos);
    await saveStoredBodyPhotos(nextPhotos);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>Setup</Text>
          <Text style={[styles.title, { color: theme.text }]}>Prepare your body photos.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Fiton Room uses these photos to create more consistent try-on results. You can add up to
            three for the first version.
          </Text>
        </View>

        <View
          style={[
            styles.uploadPanel,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>Body photos</Text>
          <Text style={[styles.panelText, { color: theme.textSecondary }]}>
            Add 1-3 full-body photos. We will connect these to S3 upload in the backend phase.
          </Text>

          <Pressable
            onPress={pickBodyPhotos}
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
              Choose photos
            </Text>
          </Pressable>

          <View style={styles.photoGrid}>
            {[0, 1, 2].map((slot) => {
              const photo = bodyPhotos[slot];

              return (
                <View
                  key={slot}
                  style={[
                    styles.photoSlot,
                    { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
                  ]}>
                  {photo ? (
                    <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                  ) : (
                    <Text style={[styles.slotText, { color: theme.textSecondary }]}>
                      Photo {slot + 1}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.tipList}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Photo guide</Text>
          {setupTips.map((tip, index) => (
            <View
              key={tip}
              style={[
                styles.tipItem,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <Text style={[styles.tipNumber, { backgroundColor: theme.accent }]}>
                {index + 1}
              </Text>
              <Text style={[styles.tipText, { color: theme.text }]}>{tip}</Text>
            </View>
          ))}
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
  uploadPanel: {
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
  panelText: {
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    paddingVertical: 15,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoSlot: {
    alignItems: 'center',
    aspectRatio: 3 / 4,
    borderRadius: AppRadii.inner,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    height: '100%',
    width: '100%',
  },
  slotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipList: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  tipItem: {
    alignItems: 'center',
    ...AppShadows.card,
    borderRadius: AppRadii.inner,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  tipNumber: {
    borderRadius: 14,
    color: '#161a24',
    fontSize: 13,
    fontWeight: '800',
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    width: 28,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
