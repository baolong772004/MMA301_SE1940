import type { Story } from '@/models';

import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { AppText, Tag } from '@/components/atoms';

type Properties = {
  readonly onPress?: (story: Story) => void;
  readonly story: Story;
};

function Banner({ onPress = undefined, story }: Properties) {
  const { borders, gutters, layout } = useTheme();
  const { t } = useTranslation();

  /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
  const containerStyle: StyleProp<ViewStyle> = [
    borders.rounded_16 as unknown as ViewStyle,
    borders.w_1 as unknown as ViewStyle,
    borders.surfaceVariant as unknown as ViewStyle,
    layout.relative as unknown as ViewStyle,
    { height: 200, overflow: 'hidden' },
  ];

  const overlayStyle: StyleProp<ViewStyle> = [
    layout.absolute as unknown as ViewStyle,
    layout.top0 as unknown as ViewStyle,
    layout.left0 as unknown as ViewStyle,
    layout.right0 as unknown as ViewStyle,
    layout.bottom0 as unknown as ViewStyle,
    { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  ];

  const contentStyle: StyleProp<ViewStyle> = [
    layout.absolute as unknown as ViewStyle,
    layout.bottom0 as unknown as ViewStyle,
    layout.left0 as unknown as ViewStyle,
    layout.right0 as unknown as ViewStyle,
    gutters.padding_16 as unknown as ViewStyle,
    gutters.gap_8 as unknown as ViewStyle,
  ];
  /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */

  return (
    <Pressable
      onPress={() => {
        onPress?.(story);
      }}
      style={containerStyle}
    >
      <Image
        resizeMode="cover"
        source={{ uri: story.coverUri }}
        style={{ height: '100%', width: '100%' }}
      />
      <View style={overlayStyle} />
      <View style={contentStyle}>
        <View style={[layout.row]}>
          <Tag label={t('home.special_event')} tone="primary" />
        </View>
        <AppText style={{ color: '#ffffff' }} variant="headlineLgMobile">
          {story.title}
        </AppText>
      </View>
    </Pressable>
  );
}

export default Banner;
