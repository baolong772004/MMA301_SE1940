/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/no-array-sort */
import type { Story } from '@/models';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Pressable, ScrollView, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { StoriesServices } from '@/services/stories';

import { AppIcon, AppText, Skeleton, Tag } from '@/components/atoms';
import { SearchBar, StoryCard } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';


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

  const sortValue = selectedSort === 'Rating' ? 'rating' : selectedSort === 'Views' ? 'views' : 'newest';
  const genreValue = selectedGenre !== 'All' ? selectedGenre : undefined;
  const statusValue = selectedStatus !== 'All' ? selectedStatus : undefined;
  const qValue = query.trim() || undefined;

  const { data: apiResponse, isLoading: isApiLoading } = useQuery({
    queryKey: ['stories-search', qValue, genreValue, statusValue, sortValue],
    queryFn: () => StoriesServices.getStories({
      q: qValue,
      genre: genreValue,
      status: statusValue as any,
      sort: sortValue as any,
      page: 1,
      limit: 20,
    }),
  });

  const isLoading = isApiLoading;

  const screenWidth = Dimensions.get('window').width;
  const numberColumns = 4;
  const paddingHorizontal = 24;
  const gapBetween = 12;
  const cardWidth = Math.floor(
    (screenWidth - paddingHorizontal * 2 - gapBetween * (numberColumns - 1)) /
      numberColumns,
  );

  const apiStories = (apiResponse?.items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    coverUri: item.coverUri ?? '',
    author: {
      name: item.author?.name ?? 'Tác giả',
      avatarUri: item.author?.avatarUri ?? undefined,
    },
    rating: item.rating ?? 0,
    views: String(item.viewCount ?? 0),
    genres: item.genres ?? [],
    status: item.status ?? 'ongoing',
  }));

  const displayStories = apiStories as unknown as Story[];

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
              onChangeText={setQuery}
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
            {GENRES.map((genre, index) => {
              const active = selectedGenre === genre;
              return (
                <Pressable
                  key={`${genre}-${index}`}
                  onPress={() => {
                    setSelectedGenre(genre);
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
          data={isLoading ? loadingData : displayStories}
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
