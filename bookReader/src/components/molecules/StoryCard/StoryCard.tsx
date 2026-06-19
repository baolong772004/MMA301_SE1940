import { Pressable, View } from 'react-native';

import type { Story } from '@/models';
import { useTheme } from '@/theme';

import { AppText, Cover } from '@/components/atoms';

type Properties = {
  readonly onPress?: (story: Story) => void;
  readonly story: Story;
  readonly width?: number;
};

function StoryCard({ onPress = undefined, story, width = 150 }: Properties) {
  const { gutters } = useTheme();

  return (
    <Pressable
      onPress={() => {
        onPress?.(story);
      }}
      style={[gutters.gap_8, { width }]}
    >
      <Cover uri={story.coverUri} />
      <View>
        <AppText color="onSurface" numberOfLines={2} variant="labelMd">
          {story.title}
        </AppText>
        <AppText color="onSurfaceVariant" numberOfLines={1} variant="labelSm">
          {story.author.name}
        </AppText>
      </View>
    </Pressable>
  );
}

export default StoryCard;
