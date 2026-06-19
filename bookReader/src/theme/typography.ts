import type { TextStyle } from 'react-native';

/**
 * Font family names — must match the keys passed to `useFonts` in
 * `src/hooks/useAppFonts.ts`. RN custom fonts have no synthetic bold, so each
 * weight is its own family. Until fonts finish loading, RN falls back to the
 * system font (App.tsx gates render on load, so this is only a safety net).
 */
export const FontFamily = {
  merriweather: 'Merriweather_400Regular',
  merriweatherBold: 'Merriweather_700Bold',
  jakarta: 'PlusJakartaSans_400Regular',
  jakartaMedium: 'PlusJakartaSans_500Medium',
  jakartaSemiBold: 'PlusJakartaSans_600SemiBold',
  jakartaBold: 'PlusJakartaSans_700Bold',
} as const;

/**
 * Typography presets translated from the NovaTales web prototype.
 * letterSpacing is absolute (em * fontSize) since RN has no em unit.
 */
export const typography = {
  display: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: 48,
    lineHeight: 60,
    letterSpacing: -0.96,
  },
  headlineLg: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: 32,
    lineHeight: 40,
  },
  headlineLgMobile: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: 28,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: 24,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: FontFamily.jakarta,
    fontSize: 18,
    lineHeight: 30,
  },
  bodyMd: {
    fontFamily: FontFamily.jakarta,
    fontSize: 16,
    lineHeight: 26,
  },
  labelMd: {
    fontFamily: FontFamily.jakartaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  labelSm: {
    fontFamily: FontFamily.jakartaMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  readingText: {
    fontFamily: FontFamily.merriweather,
    fontSize: 20,
    lineHeight: 36,
    letterSpacing: 0.2,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
