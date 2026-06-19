/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { useTheme } from '@/theme';
import { typography } from '@/theme/typography';

import { AppIcon } from '@/components/atoms';

type Properties = {
  readonly autoFocus?: boolean;
  readonly onChangeText?: (text: string) => void;
  readonly placeholder?: string;
  readonly value?: string;
};

function SearchBar({
  autoFocus = false,
  onChangeText = undefined,
  placeholder = undefined,
  value = undefined,
}: Properties) {
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const containerStyle: any = [
    layout.row as any,
    layout.itemsCenter as any,
    gutters.gap_8 as any,
    gutters.paddingHorizontal_16 as any,
    borders.rounded_9999 as any,
    backgrounds.surfaceContainer as any,
    { height: 48 },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <View style={containerStyle}>
      <AppIcon color="onSurfaceVariant" name="search" size={20} />
      <TextInput
        autoFocus={autoFocus}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('home.search_placeholder')}
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
