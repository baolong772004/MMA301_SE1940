import {
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';

/**
 * Loads the NovaTales font families. RN has no synthetic bold for custom fonts,
 * so each weight is registered as its own family (see typography.ts).
 * Returns [loaded, error].
 */
export const useAppFonts = () =>
  useFonts({
    Merriweather_400Regular,
    Merriweather_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
