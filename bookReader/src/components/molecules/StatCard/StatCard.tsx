/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppIcon, AppText } from '@/components/atoms';

type Properties = {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
};

function StatCard({ icon, label, value }: Properties) {
  const { backgrounds, borders, gutters, layout } = useTheme();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const cardStyle: any = [
    backgrounds.surfaceContainerLow,
    borders.rounded_12,
    gutters.padding_16,
    gutters.gap_8,
    layout.flex_1,
  ];

  const headerStyle: any = [
    layout.row,
    layout.itemsCenter,
    gutters.gap_8,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <View style={cardStyle}>
      <View style={headerStyle}>
        <AppIcon color="primary" name={icon} size={20} />
        <AppText color="onSurface" variant="headlineMd">
          {value}
        </AppText>
      </View>
      <AppText color="onSurfaceVariant" variant="labelSm">
        {label}
      </AppText>
    </View>
  );
}

export default StatCard;
