import { TextInput, View } from 'react-native';

import { useTheme } from '@/theme';
import { typography } from '@/theme/typography';

import { AppIcon } from '@/components/atoms';

type Properties = {
  readonly onChangeText?: (text: string) => void;
  readonly placeholder?: string;
  readonly value?: string;
};

function SearchBar({
  onChangeText = undefined,
  placeholder = 'Tìm kiếm truyện, tác giả...',
  value = undefined,
}: Properties) {
  const { backgrounds, borders, colors, gutters, layout } = useTheme();

  return (
    <View
      style={[
        layout.row,
        layout.itemsCenter,
        gutters.gap_8,
        gutters.paddingHorizontal_16,
        borders.rounded_9999,
        backgrounds.surfaceContainer,
        { height: 48 },
      ]}
    >
      <AppIcon color="onSurfaceVariant" name="search" size={20} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        style={[
          layout.flex_1,
          typography.bodyMd,
          { color: colors.onSurface, padding: 0 },
        ]}
        value={value}
      />
    </View>
  );
}

export default SearchBar;
