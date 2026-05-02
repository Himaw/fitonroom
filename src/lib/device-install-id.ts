import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_INSTALL_ID_KEY = 'fitonroom.deviceInstallId';

export async function getOrCreateDeviceInstallId() {
  if (Platform.OS === 'web') {
    const existingInstallId = globalThis.localStorage?.getItem(DEVICE_INSTALL_ID_KEY);

    if (existingInstallId) {
      return existingInstallId;
    }

    const installId = Crypto.randomUUID();
    globalThis.localStorage?.setItem(DEVICE_INSTALL_ID_KEY, installId);

    return installId;
  }

  const existingInstallId = await SecureStore.getItemAsync(DEVICE_INSTALL_ID_KEY);

  if (existingInstallId) {
    return existingInstallId;
  }

  const installId = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_INSTALL_ID_KEY, installId);

  return installId;
}
