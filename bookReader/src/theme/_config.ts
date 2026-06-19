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
  primary: '#5341cd',
  onPrimary: '#ffffff',
  primaryContainer: '#6c5ce7',
  onPrimaryContainer: '#faf6ff',
  primaryFixed: '#e4dfff',
  primaryFixedDim: '#c6bfff',
  // --- Secondary ---
  secondary: '#5952af',
  onSecondary: '#ffffff',
  secondaryContainer: '#a19afd',
  onSecondaryContainer: '#352c8a',
  // --- Tertiary (warm accent: rating / completed) ---
  tertiary: '#884800',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ac5d00',
  onTertiaryContainer: '#fff5f1',
  // --- Background / Surface ---
  background: '#f4fafd',
  onBackground: '#161d1f',
  surface: '#f4fafd',
  onSurface: '#161d1f',
  surfaceVariant: '#dde4e6',
  onSurfaceVariant: '#474554',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eef5f7',
  surfaceContainer: '#e8eff1',
  surfaceContainerHigh: '#e2e9ec',
  surfaceContainerHighest: '#dde4e6',
  inverseSurface: '#2b3234',
  inverseOnSurface: '#ebf2f4',
  // --- Outline / Error ---
  outline: '#787586',
  outlineVariant: '#c8c4d7',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
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
  primary: '#c6bfff',
  onPrimary: '#160066',
  primaryContainer: '#4029ba',
  onPrimaryContainer: '#e4dfff',
  primaryFixed: '#e4dfff',
  primaryFixedDim: '#c6bfff',
  // --- Secondary ---
  secondary: '#c5c0ff',
  onSecondary: '#140067',
  secondaryContainer: '#413996',
  onSecondaryContainer: '#e3dfff',
  // --- Tertiary ---
  tertiary: '#ffb77d',
  onTertiary: '#4a2800',
  tertiaryContainer: '#6e3900',
  onTertiaryContainer: '#ffdcc3',
  // --- Background / Surface ---
  background: '#0f1416',
  onBackground: '#dee3e5',
  surface: '#0f1416',
  onSurface: '#dee3e5',
  surfaceVariant: '#474554',
  onSurfaceVariant: '#c8c4d7',
  surfaceContainerLowest: '#0a1011',
  surfaceContainerLow: '#171d1f',
  surfaceContainer: '#1b2123',
  surfaceContainerHigh: '#252b2e',
  surfaceContainerHighest: '#303639',
  inverseSurface: '#dee3e5',
  inverseOnSurface: '#2b3234',
  // --- Outline / Error ---
  outline: '#928f9f',
  outlineVariant: '#474554',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
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
