/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/no-array-sort */
import type { Story } from '@/models';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Pressable, ScrollView, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppIcon, AppText, Skeleton, Tag } from '@/components/atoms';
import { SearchBar, StoryCard } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { recommendedStories } from '@/mocks/stories';

const GENRES = ['All', 'Fantasy', 'Adventure', 'Mystery', 'Sci-Fi', 'Romance', 'Drama'];
const STATUSES = [
  { label: 'All', value: 'All' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
];
const SORTS = ['Default', 'Rating', 'Views'];

const parseViews = (viewsString = '0') => {
  const clean = viewsString.toUpperCase();
  if (clean.endsWith('K')) {
    return Number.parseFloat(clean.replace('K', '')) * 1000;
  }
  if (clean.endsWith('M')) {
    return Number.parseFloat(clean.replace('M', '')) * 1_000_000;
  }
  return Number.parseFloat(clean) || 0;
};

function Search({ navigation }: RootScreenProps<Paths.Search>) {
  const { borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedGenre, selectedStatus, selectedSort]);

  const screenWidth = Dimensions.get('window').width;
  const numberColumns = 4;
  const paddingHorizontal = 24;
  const gapBetween = 12;
  const cardWidth = Math.floor(
    (screenWidth - paddingHorizontal * 2 - gapBetween * (numberColumns - 1)) /
      numberColumns,
  );

  const filteredStories = recommendedStories
    .filter((story) => {
      // 1. Text Query Filter
      if (query.trim()) {
        const term = query.toLowerCase();
        const matchesTitle = story.title.toLowerCase().includes(term);
        const matchesAuthor = story.author.name.toLowerCase().includes(term);
        const matchesGenre = story.genres?.some((g) =>
          g.toLowerCase().includes(term),
        );
        if (!matchesTitle && !matchesAuthor && !matchesGenre) {
          return false;
        }
      }

      // 2. Genre Filter
      if (selectedGenre !== 'All') {
        const hasGenre = story.genres?.some(
          (g) => g.toLowerCase() === selectedGenre.toLowerCase(),
        );
        if (!hasGenre) {
          return false;
        }
      }

      // 3. Status Filter
      if (selectedStatus !== 'All' && story.status !== selectedStatus) {
          return false;
        }

      return true;
    })
    .sort((a, b) => {
      // 4. Sort Filter
      if (selectedSort === 'Rating') {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      if (selectedSort === 'Views') {
        return parseViews(b.views) - parseViews(a.views);
      }
      return 0;
    });

  const customHeaderStyle = [
    layout.row,
    layout.itemsCenter,
    gutters.gap_16,
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_12,
    borders.wBottom_1,
    { borderColor: colors.outlineVariant },
  ];

  const loadingData = Array.from({ length: 8 }, (_, index) => ({
    author: { name: '' },
    coverUri: '',
    id: `skeleton-${index}`,
    title: '',
  })) as unknown as Story[];

  return (
    <ScreenContainer
      padded={false}
      scroll={false}
      showHeader={false}
    >
      <View style={[layout.flex_1, { backgroundColor: colors.surface }, gutters.gap_16]}>
        {/* Custom Header with Search Bar */}
        <View style={customHeaderStyle}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <AppIcon color="primary" name="arrow_back" />
          </Pressable>
          <View style={layout.flex_1}>
            <SearchBar
              autoFocus
              onChangeText={(text) => {
                setQuery(text);
                setIsLoading(true);
              }}
              placeholder={t('home.search_placeholder')}
              value={query}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={gutters.gap_8}>
          {/* Genre Filter */}
          <ScrollView
            contentContainerStyle={[gutters.gap_8, gutters.paddingHorizontal_24]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {GENRES.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <Pressable
                  key={genre}
                  onPress={() => {
                    setSelectedGenre(genre);
                    setIsLoading(true);
                  }}
                >
                  <Tag label={genre} tone={active ? 'primary' : 'neutral'} />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Status Filter */}
          <ScrollView
            contentContainerStyle={[gutters.gap_8, gutters.paddingHorizontal_24]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {STATUSES.map((status) => {
              const active = selectedStatus === status.value;
              return (
                <Pressable
                  key={status.value}
                  onPress={() => {
                    setSelectedStatus(status.value);
                    setIsLoading(true);
                  }}
                >
                  <Tag label={status.label} tone={active ? 'primary' : 'neutral'} />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Sort Filter */}
          <ScrollView
            contentContainerStyle={[gutters.gap_8, gutters.paddingHorizontal_24]}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {SORTS.map((sort) => {
              const active = selectedSort === sort;
              return (
                <Pressable
                  key={sort}
                  onPress={() => {
                    setSelectedSort(sort);
                    setIsLoading(true);
                  }}
                >
                  <Tag label={sort} tone={active ? 'primary' : 'neutral'} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Results List */}
        <FlatList
          columnWrapperStyle={[layout.justifyStart, gutters.gap_12]}
          contentContainerStyle={[
            gutters.gap_24,
            gutters.paddingHorizontal_24,
            gutters.paddingBottom_24,
          ]}
          data={isLoading ? loadingData : filteredStories}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isLoading ? undefined : (
              <View
                style={[
                  layout.flex_1,
                  layout.itemsCenter,
                  layout.justifyCenter,
                  gutters.gap_16,
                  { paddingTop: 80 },
                ]}
              >
                <AppIcon color="onSurfaceVariant" name="search" size={64} />
                <AppText color="onSurfaceVariant" variant="bodyMd">
                  {t('search.no_results')}
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

export default Search;
