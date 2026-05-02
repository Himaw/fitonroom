import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type StoredBodyPhoto = {
  id: string;
  uri: string;
};

const BODY_PHOTOS_KEY = 'fitonroom.bodyPhotos';

export async function getStoredBodyPhotos(): Promise<StoredBodyPhoto[]> {
  const storedPhotos =
    Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(BODY_PHOTOS_KEY)
      : await SecureStore.getItemAsync(BODY_PHOTOS_KEY);

  if (!storedPhotos) {
    return [];
  }

  try {
    const parsedPhotos = JSON.parse(storedPhotos);
    return Array.isArray(parsedPhotos) ? parsedPhotos.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function saveStoredBodyPhotos(photos: StoredBodyPhoto[]) {
  const serializedPhotos = JSON.stringify(photos.slice(0, 3));

  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(BODY_PHOTOS_KEY, serializedPhotos);
    return;
  }

  await SecureStore.setItemAsync(BODY_PHOTOS_KEY, serializedPhotos);
}

