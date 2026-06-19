import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppIcon, AppText } from '@/components/atoms';

type Properties = {
  readonly count?: number;
  readonly value: number;
};

function RatingStars({ count = undefined, value }: Properties) {
  const { gutters, layout } = useTheme();

  return (
    <View style={[layout.row, layout.itemsCenter, gutters.gap_4]}>
      <AppIcon color="tertiary" name="star" size={18} />
      <AppText color="onSurface" variant="labelMd">
        {value.toFixed(1)}
      </AppText>
      {count === undefined ? undefined : (
        <AppText color="onSurfaceVariant" variant="labelSm">
          ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </AppText>
      )}
    </View>
  );
}

export default RatingStars;
