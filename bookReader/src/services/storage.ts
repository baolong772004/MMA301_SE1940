import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Minimal synchronous storage interface (MMKV-shaped) so consumers can read in
 * render without awaiting. MMKV is not available in Expo Go, so we back it with
 * AsyncStorage + an in-memory cache that must be hydrated before first render
 * (see `hydrateStorage` called in App.tsx).
 */
export type AppStorage = {
  delete: (key: string) => void;
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

const cache = new Map<string, string>();

// Keys that need to be available synchronously at startup.
const PERSISTENT_KEYS = ['theme'];

export const storage: AppStorage = {
  delete(key) {
    cache.delete(key);
    void AsyncStorage.removeItem(key);
  },
  getString(key) {
    return cache.get(key);
  },
  set(key, value) {
    cache.set(key, value);
    void AsyncStorage.setItem(key, value);
  },
};

export const hydrateStorage = async () => {
  const entries = await AsyncStorage.multiGet(PERSISTENT_KEYS);
  for (const [key, value] of entries) {
    if (value != undefined) {
      cache.set(key, value);
    }
  }
};
