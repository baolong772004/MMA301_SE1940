import { Image, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly radius?: number;
  readonly uri: string;
  readonly width?: `${number}%` | number;
};

/** Book cover image with the standard 2:3 aspect ratio. */
function Cover({ radius = 8, uri, width = '100%' }: Properties) {
  const { borders, colors } = useTheme();

  return (
    <View
      style={[
        borders.w_1,
        {
          aspectRatio: 2 / 3,
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: colors.surfaceVariant,
          borderRadius: radius,
          overflow: 'hidden',
          width,
        },
      ]}
    >
      <Image source={{ uri }} style={{ height: '100%', width: '100%' }} />
    </View>
  );
}

export default Cover;
