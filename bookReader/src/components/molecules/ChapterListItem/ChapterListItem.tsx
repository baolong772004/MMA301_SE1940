import { Pressable, View } from 'react-native';

import type { Chapter } from '@/models';
import { useTheme } from '@/theme';

import { AppText } from '@/components/atoms';

type Properties = {
  readonly chapter: Chapter;
  readonly onPress?: () => void;
};

function ChapterListItem({ chapter, onPress = undefined }: Properties) {
  const { borders, gutters, layout } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        layout.row,
        layout.itemsCenter,
        layout.justifyBetween,
        gutters.gap_16,
        gutters.padding_16,
        borders.rounded_8,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[layout.row, layout.itemsCenter, gutters.gap_16, layout.flex_1]}>
        <AppText
          color="onSurfaceVariant"
          style={{ width: 28 }}
          variant="labelMd"
        >
          {String(chapter.index).padStart(2, '0')}
        </AppText>
        <AppText color="onSurface" numberOfLines={1} variant="bodyMd">
          {chapter.title}
        </AppText>
      </View>
      <AppText color="onSurfaceVariant" variant="labelSm">
        {chapter.date}
      </AppText>
    </Pressable>
  );
}

export default ChapterListItem;
