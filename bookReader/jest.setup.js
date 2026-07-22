import './src/tests/__mocks__/libs';
import './src/tests/__mocks__/getAssetsContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@expo-google-fonts/merriweather', () => ({
  Merriweather_400Regular: 'Merriweather_400Regular',
  Merriweather_700Bold: 'Merriweather_700Bold',
}));

jest.mock('@expo-google-fonts/plus-jakarta-sans', () => ({
  PlusJakartaSans_400Regular: 'PlusJakartaSans_400Regular',
  PlusJakartaSans_500Medium: 'PlusJakartaSans_500Medium',
  PlusJakartaSans_600SemiBold: 'PlusJakartaSans_600SemiBold',
  PlusJakartaSans_700Bold: 'PlusJakartaSans_700Bold',
}));

jest.mock('expo-font', () => ({ useFonts: () => [true, undefined] }));
