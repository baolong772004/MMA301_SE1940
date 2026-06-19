/* eslint-disable no-magic-numbers */
import type { Story } from '@/models';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppIcon, AppText, Skeleton } from '@/components/atoms';
import { StoryCard, Tabs } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import {
  completedStories,
  readingStories,
  savedStories,
} from '@/mocks/library';

function Library({ navigation }: MainTabScreenProps<Paths.Library>) {
  const { borders, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [activeTab]);

  const screenWidth = Dimensions.get('window').width;
  const numberColumns = 4;
  const paddingHorizontal = 24;
  const gapBetween = 12;
  const cardWidth = Math.floor(
    (screenWidth - paddingHorizontal * 2 - gapBetween * (numberColumns - 1)) /
      numberColumns,
  );

  const getStoriesByTab = () => {
    switch (activeTab) {
      case 0: {
        return readingStories;
      }
      case 1: {
        return savedStories;
      }
      case 2: {
        return completedStories;
      }
      default: {
        return readingStories;
      }
    }
  };

  const stories = getStoriesByTab();
  const loadingData = Array.from({ length: 8 }, (_, index) => ({
    author: { name: '' },
    coverUri: '',
    id: `skeleton-${index}`,
    title: '',
  })) as unknown as Story[];

  return (
    <ScreenContainer
      padded
      scroll={false}
      title={t('library.title')}
    >
      <View style={[layout.flex_1, gutters.gap_24]}>
        <Tabs
          activeIndex={activeTab}
          onChange={(index) => {
            setActiveTab(index);
            setIsLoading(true);
          }}
          tabs={[
            t('library.reading_tab'),
            t('library.saved_tab'),
            t('library.completed_tab'),
          ]}
        />

        <FlatList
          columnWrapperStyle={[layout.justifyStart, gutters.gap_12]}
          contentContainerStyle={[gutters.gap_24, gutters.paddingBottom_24]}
          data={isLoading ? loadingData : stories}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isLoading ? undefined : (
              <View
                style={[
                  layout.flex_1,
                  layout.itemsCenter,
                  layout.justifyCenter,
                  gutters.gap_16,
                  { paddingTop: 100 },
                ]}
              >
                <AppIcon color="onSurfaceVariant" name="auto_stories" size={64} />
                <AppText color="onSurfaceVariant" variant="bodyMd">
                  {t('library.empty_state')}
                </AppText>
              </View>
            )
          }
          numColumns={numberColumns}
          renderItem={({ item }) => {
            if (isLoading) {
              return (
                <View style={[gutters.gap_8, { width: cardWidth }]}>
                  <Skeleton
                    height={cardWidth * 1.5}
                    loading
                    style={borders.rounded_8}
                    width={cardWidth}
                  />
                  <Skeleton height={14} loading width={cardWidth * 0.8} />
                  <Skeleton height={10} loading width={cardWidth * 0.5} />
                </View>
              );
            }
            return (
              <StoryCard
                onPress={() => {
                  navigation.navigate(Paths.StoryDetail, { storyId: item.id });
                }}
                story={item}
                width={cardWidth}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          style={layout.flex_1}
        />
      </View>
    </ScreenContainer>
  );
}

export default Library;
