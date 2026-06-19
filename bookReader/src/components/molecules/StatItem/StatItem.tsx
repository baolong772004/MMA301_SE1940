import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from '@/components/atoms';

type Properties = {
  readonly label: string;
  readonly value: string;
};

function StatItem({ label, value }: Properties) {
  const { gutters, layout } = useTheme();

  return (
    <View style={[layout.itemsCenter, gutters.gap_4]}>
      <AppText color="onSurface" variant="labelMd">
        {value}
      </AppText>
      <AppText color="onSurfaceVariant" variant="labelSm">
        {label}
      </AppText>
    </View>
  );
}

export default StatItem;
