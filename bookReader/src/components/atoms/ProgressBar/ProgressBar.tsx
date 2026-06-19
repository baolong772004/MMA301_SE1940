import { View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly height?: number;
  readonly value: number; // 0..1
};

function ProgressBar({ height = 6, value }: Properties) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View
      style={{
        backgroundColor: colors.surfaceVariant,
        borderRadius: height / 2,
        height,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <View
        style={{
          backgroundColor: colors.primary,
          height: '100%',
          width: `${clamped * 100}%`,
        }}
      />
    </View>
  );
}

export default ProgressBar;
