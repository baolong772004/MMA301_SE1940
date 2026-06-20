import type { Story } from '@/models';

import { FlatList, View } from 'react-native';

import { useTheme } from '@/theme';

import { StoryCard } from '@/components/molecules';

type Properties = {
  readonly data: Story[];
  readonly onPressItem?: (story: Story) => void;
};

function Separator() {
  const { gutters } = useTheme();
  return <View style={gutters.marginRight_12} />;
}

function StoryCarousel({ data, onPressItem = undefined }: Properties) {
  return (
    <FlatList
      data={data}
      horizontal
      ItemSeparatorComponent={Separator}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoryCard onPress={onPressItem} story={item} />
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}

export default StoryCarousel;
