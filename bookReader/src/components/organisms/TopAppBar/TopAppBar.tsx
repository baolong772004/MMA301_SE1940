import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppIcon, AppText } from '@/components/atoms';

type Properties = {
  readonly onLeftPress?: () => void;
  readonly onRightPress?: () => void;
  readonly rightIcon?: string;
  readonly showBack?: boolean;
  readonly title?: string;
};

const HIT_SLOP = 8;

function TopAppBar({
  onLeftPress = undefined,
  onRightPress = undefined,
  rightIcon = 'search',
  showBack = false,
  title = 'NovaTales',
}: Properties) {
  const { backgrounds, borders, gutters, layout } = useTheme();

  return (
    <View
      style={[
        layout.row,
        layout.itemsCenter,
        layout.justifyBetween,
        backgrounds.surface,
        borders.wBottom_1,
        borders.surfaceVariant,
        gutters.paddingHorizontal_24,
        { height: 56 },
      ]}
    >
      <View style={[{ width: 40 }]}>
        {(showBack || onLeftPress) && (
          <Pressable hitSlop={HIT_SLOP} onPress={onLeftPress}>
            <AppIcon
              color="primary"
              name={showBack ? 'arrow_back' : 'menu'}
            />
          </Pressable>
        )}
      </View>

      <AppText color="primary" variant="headlineMd">
        {title}
      </AppText>

      <View style={[layout.itemsEnd, { width: 40 }]}>
        {(onRightPress || rightIcon) && (
          <Pressable hitSlop={HIT_SLOP} onPress={onRightPress}>
            <AppIcon color="onSurfaceVariant" name={rightIcon} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default TopAppBar;
