import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { Colors } from '@/theme/types/colors';

import { AppText } from '@/components/atoms';

type Tone = 'neutral' | 'primary' | 'secondary' | 'tertiary';

type Properties = {
  readonly label: string;
  readonly tone?: Tone;
};

const TONE: Record<Tone, { bg: keyof Colors; fg: keyof Colors }> = {
  neutral: { bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant' },
  primary: { bg: 'primary', fg: 'onPrimary' },
  secondary: { bg: 'secondaryContainer', fg: 'onSecondaryContainer' },
  tertiary: { bg: 'tertiaryContainer', fg: 'onTertiaryContainer' },
};

function Tag({ label, tone = 'secondary' }: Properties) {
  const { borders, colors, gutters } = useTheme();
  const spec = TONE[tone];

  return (
    <View
      style={[
        gutters.paddingHorizontal_12,
        borders.rounded_9999,
        { backgroundColor: colors[spec.bg], paddingVertical: 4 },
      ]}
    >
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
