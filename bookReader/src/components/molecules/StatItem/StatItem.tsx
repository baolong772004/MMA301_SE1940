import type { ReactNode } from 'react';

import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from '@/components/atoms';

type Properties = {
  readonly label: string;
  readonly value: ReactNode;
};

function StatItem({ label, value }: Properties) {
  const { gutters, layout } = useTheme();

  return (
    <View style={[layout.itemsCenter, gutters.gap_4]}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <AppText color="onSurface" variant="labelMd">
          {value}
        </AppText>
      ) : (
        value
      )}
      <AppText color="onSurfaceVariant" variant="labelSm">
        {label}
      </AppText>
    </View>
  );
}

export default StatItem;
