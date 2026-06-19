/* eslint-disable no-magic-numbers */
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppIcon, AppText } from '@/components/atoms';

type Properties = {
  readonly iconName: string;
  readonly label: string;
  readonly onPress?: () => void;
  readonly rightElement?: React.ReactNode;
};

function SettingRow({
  iconName,
  label,
  onPress = undefined,
  rightElement = undefined,
}: Properties) {
  const { colors, gutters, layout } = useTheme();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        layout.row,
        layout.itemsCenter,
        layout.justifyBetween,
        gutters.paddingVertical_16,
        {
          borderBottomColor: colors.outlineVariant,
          borderBottomWidth: 1,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[layout.row, layout.itemsCenter, gutters.gap_16]}>
        <AppIcon color="primary" name={iconName} size={24} />
        <AppText color="onSurface" variant="bodyLg">
          {label}
        </AppText>
      </View>
      {rightElement ?? (
        <AppIcon color="onSurfaceVariant" name="chevron_right" size={20} />
      )}
    </Pressable>
  );
}

export default SettingRow;
