import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import type { ThemeConfiguration } from '@/theme/types/config';

export const enum Variant {
  DARK = 'dark',
}

/**
 * NovaTales design tokens (Material 3).
 * Legacy keys (gray, purple, skeleton families) are kept so existing
 * boilerplate code (Example, components.ts, Skeleton) keeps compiling.
 */
const colorsLight = {
  // --- Brand / Primary ---
  onPrimary: '#ffffff',
  onPrimaryContainer: '#faf6ff',
  primary: '#5341cd',
  primaryContainer: '#6c5ce7',
  primaryFixed: '#e4dfff',
  primaryFixedDim: '#c6bfff',
  // --- Secondary ---
  onSecondary: '#ffffff',
  onSecondaryContainer: '#352c8a',
  secondary: '#5952af',
  secondaryContainer: '#a19afd',
  // --- Tertiary (warm accent: rating / completed) ---
  onTertiary: '#ffffff',
  onTertiaryContainer: '#fff5f1',
  tertiary: '#884800',
  tertiaryContainer: '#ac5d00',
  // --- Background / Surface ---
  background: '#f4fafd',
  inverseOnSurface: '#ebf2f4',
  inverseSurface: '#2b3234',
  onBackground: '#161d1f',
  onSurface: '#161d1f',
  onSurfaceVariant: '#474554',
  surface: '#f4fafd',
  surfaceContainer: '#e8eff1',
  surfaceContainerHigh: '#e2e9ec',
  surfaceContainerHighest: '#dde4e6',
  surfaceContainerLow: '#eef5f7',
  surfaceContainerLowest: '#ffffff',
  surfaceVariant: '#dde4e6',
  // --- Outline / Error ---
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',
  outline: '#787586',
  outlineVariant: '#c8c4d7',
  // --- Legacy (do not remove) ---
  gray100: '#DFDFDF',
  gray200: '#A1A1A1',
  gray400: '#4D4D4D',
  gray50: '#EFEFEF',
  gray800: '#303030',
  purple100: '#E1E1EF',
  purple50: '#1B1A23',
  purple500: '#44427D',
  red500: '#C13333',
  skeleton: '#dde4e6',
} as const;

const colorsDark = {
  // --- Brand / Primary ---
  onPrimary: '#160066',
  onPrimaryContainer: '#e4dfff',
  primary: '#c6bfff',
  primaryContainer: '#4029ba',
  primaryFixed: '#e4dfff',
  primaryFixedDim: '#c6bfff',
  // --- Secondary ---
  onSecondary: '#140067',
  onSecondaryContainer: '#e3dfff',
  secondary: '#c5c0ff',
  secondaryContainer: '#413996',
  // --- Tertiary ---
  onTertiary: '#4a2800',
  onTertiaryContainer: '#ffdcc3',
  tertiary: '#ffb77d',
  tertiaryContainer: '#6e3900',
  // --- Background / Surface ---
  background: '#0f1416',
  inverseOnSurface: '#2b3234',
  inverseSurface: '#dee3e5',
  onBackground: '#dee3e5',
  onSurface: '#dee3e5',
  onSurfaceVariant: '#c8c4d7',
  surface: '#0f1416',
  surfaceContainer: '#1b2123',
  surfaceContainerHigh: '#252b2e',
  surfaceContainerHighest: '#303639',
  surfaceContainerLow: '#171d1f',
  surfaceContainerLowest: '#0a1011',
  surfaceVariant: '#474554',
  // --- Outline / Error ---
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',
  outline: '#928f9f',
  outlineVariant: '#474554',
  // --- Legacy (do not remove) ---
  gray100: '#000000',
  gray200: '#BABABA',
  gray400: '#969696',
  gray50: '#EFEFEF',
  gray800: '#E0E0E0',
  purple100: '#252732',
  purple50: '#1B1A23',
  purple500: '#A6A4F0',
  red500: '#C13333',
  skeleton: '#303639',
} as const;

// NovaTales typographic px scale (label → display) + legacy 80.
const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 80] as const;
// Spacing scale: xs(4) base(8) sm(12) +legacy(16) md(24) +legacy(32) (40) lg(48) xl(80).
const spacing = [4, 8, 12, 16, 24, 32, 40, 48, 80] as const;

export const config = {
  backgrounds: colorsLight,
  borders: {
    colors: colorsLight,
    radius: [4, 8, 12, 16, 9999],
    widths: [1, 2],
  },
  colors: colorsLight,
  fonts: {
    colors: colorsLight,
    sizes: fontSizes,
  },
  gutters: spacing,
  navigationColors: {
    ...DefaultTheme.colors,
    background: colorsLight.background,
    card: colorsLight.surface,
    primary: colorsLight.primary,
    text: colorsLight.onBackground,
  },
  variants: {
    dark: {
      backgrounds: colorsDark,
      borders: {
        colors: colorsDark,
      },
      colors: colorsDark,
      fonts: {
        colors: colorsDark,
      },
      navigationColors: {
        ...DarkTheme.colors,
        background: colorsDark.background,
        card: colorsDark.surface,
        primary: colorsDark.primary,
        text: colorsDark.onBackground,
      },
    },
  },
} as const satisfies ThemeConfiguration;
