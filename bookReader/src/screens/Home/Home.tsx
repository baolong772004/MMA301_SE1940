import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { StoriesServices } from '@/services/stories';

import { Skeleton, AppText } from '@/components/atoms';
import {
  ContinueReadingCard,
  SearchBar,
  SectionHeader,
} from '@/components/molecules';
import { Banner, StoryCarousel } from '@/components/organisms';
import { ScreenContainer } from '@/components/templates';

function Home({ navigation }: MainTabScreenProps<Paths.Home>) {
  const { borders, gutters, layout } = useTheme();
  const { t } = useTranslation();

  // Fetch public approved stories
  const { data: storiesResponse, isLoading: isFetchingStories } = useQuery({
    queryKey: ['home-stories'],
    queryFn: () => StoriesServices.getStories({ limit: 10 }),
  });

  const isLoading = isFetchingStories;
  const stories = storiesResponse?.items ?? [];

  // Determine featured story (first approved story) and recommended list
  const featured = stories.length > 0 ? stories[0] : null;
  const recommended = stories.length > 1 ? stories.slice(1) : stories;

  return (
    <ScreenContainer
      onRightPress={() => {
        navigation.navigate(Paths.Search);
      }}
      rightIcon="search"
      title="NovaTales"
    >
      {/* Search Input Link */}
      <Pressable
        onPress={() => {
          navigation.navigate(Paths.Search);
        }}
      >
        <View pointerEvents="none">
          <SearchBar
            placeholder={t('home.search_placeholder')}
          />
        </View>
      </Pressable>

      {/* Featured Banner */}
      {isLoading ? (
        <Skeleton
          height={200}
          loading
          style={borders.rounded_16}
          width="100%"
        />
      ) : featured ? (
        <Banner
          onPress={(story) => {
            navigation.navigate(Paths.StoryDetail, { storyId: story.id });
          }}
          story={featured as any}
        />
      ) : (
        <View style={{ backgroundColor: '#F4F4F6', borderRadius: 16, padding: 32, alignItems: 'center' }}>
          <AppText color="onSurfaceVariant" variant="bodyMd">Chào mừng bạn đến với NovaTales!</AppText>
        </View>
      )}

      {/* Recommended Carousel */}
      <View style={gutters.gap_12}>
        <SectionHeader
          actionLabel={t('home.see_all')}
          onAction={() => {
            navigation.navigate(Paths.Search);
          }}
          title={t('home.recommended_title')}
        />
        {isLoading ? (
          <View style={[layout.row, gutters.gap_12]}>
            {[1, 2, 3].map((num) => (
              <View key={`rec-skel-${num}`} style={[gutters.gap_8, { width: 150 }]}>
                <Skeleton
                  height={225}
                  loading
                  style={borders.rounded_8}
                  width={150}
                />
                <Skeleton height={16} loading width={120} />
                <Skeleton height={12} loading width={80} />
              </View>
            ))}
          </View>
        ) : recommended.length > 0 ? (
          <StoryCarousel
            data={recommended as any[]}
            onPressItem={(story) => {
              navigation.navigate(Paths.StoryDetail, { storyId: story.id });
            }}
          />
        ) : (
          <View style={{ backgroundColor: '#F4F4F6', borderRadius: 12, padding: 24, alignItems: 'center' }}>
            <AppText color="onSurfaceVariant" variant="bodyMd">Chưa có truyện đề xuất.</AppText>
          </View>
        )}
      </View>

    </ScreenContainer>
  );
}

export default Home;
