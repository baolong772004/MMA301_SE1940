import type { ReadingProgress } from '@/models';

import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText, Cover, ProgressBar } from '@/components/atoms';

type Properties = {
  readonly item: ReadingProgress;
  readonly onPress?: () => void;
};

function ContinueReadingCard({ item, onPress = undefined }: Properties) {
  const { backgrounds, borders, gutters, layout } = useTheme();
  const { chapterLabel, progress, story } = item;

  return (
    <Pressable
      onPress={onPress}
      style={[
        layout.row,
        layout.itemsCenter,
        gutters.gap_16,
        gutters.padding_16,
        borders.rounded_12,
        borders.w_1,
        borders.surfaceVariant,
        backgrounds.surfaceContainerLow,
      ]}
    >
      <Cover uri={story.coverUri} width={56} />
      <View style={[layout.flex_1, gutters.gap_8]}>
        <View style={gutters.gap_4}>
          <AppText color="onSurface" numberOfLines={1} variant="labelMd">
            {story.title}
          </AppText>
          <AppText color="onSurfaceVariant" numberOfLines={1} variant="labelSm">
            {chapterLabel}
          </AppText>
        </View>
        <ProgressBar value={progress} />
        <AppText
          color="onSurfaceVariant"
          style={{ textAlign: 'right' }}
          variant="labelSm"
        >
          {Math.round(progress * 100)}%
        </AppText>
      </View>
    </Pressable>
  );
}

export default ContinueReadingCard;
