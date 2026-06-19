/* eslint-disable no-magic-numbers */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Skeleton } from '@/components/atoms';
import {
  ContinueReadingCard,
  SearchBar,
  SectionHeader,
} from '@/components/molecules';
import { Banner, StoryCarousel } from '@/components/organisms';
import { ScreenContainer } from '@/components/templates';

import {
  continueReading,
  featuredStory,
  recommendedStories,
} from '@/mocks/stories';

function Home({ navigation }: MainTabScreenProps<Paths.Home>) {
  const { borders, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <ScreenContainer
      onRightPress={() => {
        navigation.navigate(Paths.Search);
      }}
      rightIcon="search"
      title="NovaTales"
    >
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

      {isLoading ? (
        <Skeleton
          height={200}
          loading
          style={borders.rounded_16}
          width="100%"
        />
      ) : (
        <Banner
          onPress={(story) => {
            navigation.navigate(Paths.StoryDetail, { storyId: story.id });
          }}
          story={featuredStory}
        />
      )}

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
            {[1, 2, 3].map((key) => (
              <View key={key} style={[gutters.gap_8, { width: 150 }]}>
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
        ) : (
          <StoryCarousel
            data={recommendedStories}
            onPressItem={(story) => {
              navigation.navigate(Paths.StoryDetail, { storyId: story.id });
            }}
          />
        )}
      </View>

      <View style={gutters.gap_12}>
        <SectionHeader title={t('home.continue_reading_title')} />
        <View style={gutters.gap_12}>
          {isLoading
            ? [1, 2].map((key) => (
                <Skeleton
                  height={96}
                  key={key}
                  loading
                  style={borders.rounded_12}
                  width="100%"
                />
              ))
            : continueReading.map((progress) => (
                <ContinueReadingCard
                  item={progress}
                  key={progress.story.id}
                  onPress={() => {
                    navigation.navigate(Paths.Reader, { storyId: progress.story.id });
                  }}
                />
              ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

export default Home;
