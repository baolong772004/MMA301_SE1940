import type { TextStyle } from 'react-native';

/**
 * Font family names — must match the keys passed to `useFonts` in
 * `src/hooks/useAppFonts.ts`. RN custom fonts have no synthetic bold, so each
 * weight is its own family. Until fonts finish loading, RN falls back to the
 * system font (App.tsx gates render on load, so this is only a safety net).
 */
export const FontFamily = {
  jakarta: 'PlusJakartaSans_400Regular',
  jakartaBold: 'PlusJakartaSans_700Bold',
  jakartaMedium: 'PlusJakartaSans_500Medium',
  jakartaSemiBold: 'PlusJakartaSans_600SemiBold',
  merriweather: 'Merriweather_400Regular',
  merriweatherBold: 'Merriweather_700Bold',
} as const;

/**
 * Typography presets translated from the NovaTales web prototype.
 * letterSpacing is absolute (em * fontSize) since RN has no em unit.
 */
export const typography = {
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
  display: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: 48,
    letterSpacing: -0.96,
    lineHeight: 60,
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
  labelMd: {
    fontFamily: FontFamily.jakartaSemiBold,
    fontSize: 14,
    letterSpacing: 0.7,
    lineHeight: 20,
  },
  labelSm: {
    fontFamily: FontFamily.jakartaMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  readingText: {
    fontFamily: FontFamily.merriweather,
    fontSize: 20,
    letterSpacing: 0.2,
    lineHeight: 36,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
