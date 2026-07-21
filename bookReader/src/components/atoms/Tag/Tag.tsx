/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { Colors } from '@/theme/types/colors';

import AppText from '../AppText/AppText';

type Properties = {
  readonly label: string;
  readonly tone?: Tone;
};

type Tone = 'neutral' | 'primary' | 'secondary' | 'tertiary';

const TONE: Record<Tone, { bg: keyof Colors; fg: keyof Colors }> = {
  neutral: { bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant' },
  primary: { bg: 'primary', fg: 'onPrimary' },
  secondary: { bg: 'secondaryContainer', fg: 'onSecondaryContainer' },
  tertiary: { bg: 'tertiaryContainer', fg: 'onTertiaryContainer' },
};

function Tag({ label, tone = 'secondary' }: Properties) {
  const { borders, colors, gutters } = useTheme();
  const spec = TONE[tone];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const containerStyle: any = [
    gutters.paddingHorizontal_12 as any,
    borders.rounded_9999 as any,
    { backgroundColor: colors[spec.bg], paddingVertical: 4 },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <View style={containerStyle}>
      <AppText
        color={spec.fg}
        style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}
        variant="labelSm"
      >
        {label}
      </AppText>
    </View>
  );
}

export default Tag;
