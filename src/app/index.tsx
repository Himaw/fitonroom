import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRadii, AppShadows, BottomTabInset, MaxContentWidth } from '@/constants/theme';
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
  const [productUrl, setProductUrl] = useState('');
  const [draftProductUrl, setDraftProductUrl] = useState('');
  const [isUrlDialogVisible, setIsUrlDialogVisible] = useState(false);

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

  const openUrlDialog = () => {
    setDraftProductUrl(productUrl);
    setIsUrlDialogVisible(true);
  };

  const saveProductUrl = () => {
    setProductUrl(draftProductUrl.trim());
    setIsUrlDialogVisible(false);
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
              Upload photos/screenshots
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
            <View style={styles.urlSummary}>
              <Text style={[styles.urlLabel, { color: theme.textSecondary }]}>Product URL</Text>
              <Text
                numberOfLines={productUrl ? 2 : 1}
                style={[
                  styles.urlValue,
                  { color: productUrl ? theme.text : theme.textSecondary },
                ]}>
                {productUrl || 'No product URL added yet'}
              </Text>
            </View>
            <Pressable
              onPress={openUrlDialog}
              style={[styles.secondaryButton, { borderColor: theme.border }]}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                {productUrl ? 'Change URL' : 'Add URL'}
              </Text>
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

      <Modal
        animationType="fade"
        transparent
        visible={isUrlDialogVisible}
        onRequestClose={() => setIsUrlDialogVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.dialogRoot}>
          <Pressable
            aria-label="Close URL dialog"
            onPress={() => setIsUrlDialogVisible(false)}
            style={styles.dialogBackdrop}
          />
          <View
            style={[
              styles.dialogCard,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <Text style={[styles.dialogEyebrow, { color: theme.primary }]}>Product URL</Text>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>Add clothing link</Text>
            <Text style={[styles.dialogText, { color: theme.textSecondary }]}>
              Paste the product page URL for the item you want to try on.
            </Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              inputMode="url"
              onChangeText={setDraftProductUrl}
              placeholder="https://store.com/product"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.dialogInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={draftProductUrl}
            />

            <View style={styles.dialogActions}>
              <Pressable
                onPress={() => setIsUrlDialogVisible(false)}
                style={[styles.dialogSecondaryButton, { borderColor: theme.border }]}>
                <Text style={[styles.dialogSecondaryText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveProductUrl}
                style={[styles.dialogPrimaryButton, { backgroundColor: theme.primary }]}>
                <Text style={[styles.dialogPrimaryText, { color: theme.primaryText }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: 8,
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 39,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
  },
  setupPrompt: {
    ...AppShadows.card,
    borderRadius: AppRadii.card,
    borderWidth: 1,
    gap: 10,
    padding: 20,
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
    borderRadius: AppRadii.control,
    marginTop: 4,
    paddingVertical: 14,
  },
  setupButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  panel: {
    ...AppShadows.card,
    borderRadius: AppRadii.card,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
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
    borderRadius: AppRadii.control,
    flex: 1,
    maxHeight: 110,
  },
  urlBox: {
    borderRadius: AppRadii.inner,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  urlSummary: {
    gap: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  urlValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    borderWidth: 1,
    paddingVertical: 13,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusCard: {
    ...AppShadows.card,
    borderRadius: AppRadii.card,
    borderWidth: 1,
    gap: 8,
    padding: 20,
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
  dialogRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 16, 22, 0.48)',
  },
  dialogCard: {
    ...AppShadows.card,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    maxWidth: 420,
    padding: 22,
    width: '100%',
  },
  dialogEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  dialogText: {
    fontSize: 15,
    lineHeight: 22,
  },
  dialogInput: {
    borderRadius: AppRadii.control,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  dialogPrimaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    flex: 1,
    paddingVertical: 14,
  },
  dialogPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dialogSecondaryButton: {
    alignItems: 'center',
    borderRadius: AppRadii.control,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  dialogSecondaryText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
