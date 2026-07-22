/* eslint-disable no-magic-numbers */
import type { Story } from '@/models';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, FlatList, Pressable, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { LibraryServices } from '@/services/library';
import { parseApiError } from '@/services/auth';

import { AppIcon, AppText, Skeleton } from '@/components/atoms';
import { StoryCard, Tabs, ContinueReadingCard } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';


function Library({ navigation }: MainTabScreenProps<Paths.Library>) {
  const { borders, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  const { data: libraryData, isLoading: isFetchingLibrary } = useQuery({
    queryKey: ['library'],
    queryFn: () => LibraryServices.getLibrary(),
  });

  const { data: continueData, isLoading: isFetchingContinue } = useQuery({
    queryKey: ['continue-reading'],
    queryFn: () => LibraryServices.getContinueReading(),
  });

  const screenWidth = Dimensions.get('window').width;
  const numberColumns = 4;
  const paddingHorizontal = 24;
  const gapBetween = 12;
  const cardWidth = Math.floor(
    (screenWidth - paddingHorizontal * 2 - gapBetween * (numberColumns - 1)) /
      numberColumns,
  );

  async function handleRemoveFromLibrary(story: any) {
    Alert.alert('Xác nhận', `Bạn có muốn xóa "${story.title}" khỏi thư viện không?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await LibraryServices.removeFromLibrary(story.id);
            Alert.alert('Thành công', 'Đã xóa khỏi thư viện!');
            await queryClient.invalidateQueries({ queryKey: ['library'] });
          } catch (err: unknown) {
            const errorMsg = await parseApiError(err, 'Xóa khỏi thư viện thất bại.');
            Alert.alert('Lỗi', errorMsg);
          }
        },
      },
    ]);
  }



  const getSavedStories = () => {
    if (!libraryData) return [];
    const items = libraryData.SAVED ?? [];
    return items.map((item) => ({
      id: item.story?.id ?? item.storyId,
      title: item.story?.title ?? 'Truyện',
      coverUri: item.story?.coverUri ?? '',
      author: {
        id: item.story?.author?.id ?? '',
        name: item.story?.author?.name ?? 'Tác giả',
      },
    }));
  };

  const stories = getSavedStories();
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
      onRightPress={() => {
        navigation.navigate(Paths.Search);
      }}
    >
      <View style={[layout.flex_1, gutters.gap_24]}>
        <Tabs
          activeIndex={activeTab}
          onChange={(index) => {
            setActiveTab(index);
          }}
          tabs={[
            t('library.reading_tab'),
            t('library.saved_tab'),
          ]}
        />


        {activeTab === 1 && stories.length > 0 ? (
          <AppText color="onSurfaceVariant" variant="labelSm" style={{ fontStyle: 'italic', textAlign: 'center', marginTop: -8 }}>
            💡 Nhấn giữ (Long press) vào truyện để xóa khỏi thư viện
          </AppText>
        ) : null}

        <FlatList
          key={activeTab === 0 ? 'reading-list' : 'saved-grid'}
          numColumns={activeTab === 0 ? 1 : numberColumns}
          columnWrapperStyle={activeTab === 0 ? undefined : [layout.justifyStart, gutters.gap_12]}
          contentContainerStyle={[gutters.gap_24, gutters.paddingBottom_24]}
          data={(activeTab === 0 ? (isFetchingContinue ? loadingData : continueData) : (isFetchingLibrary ? loadingData : stories)) as any[]}
          keyExtractor={(item: any, index) => item.id ?? item.story?.id ?? String(index)}
          ListEmptyComponent={
            (activeTab === 0 ? isFetchingContinue : isFetchingLibrary) ? undefined : (
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
          renderItem={({ item, index }: { item: any; index: number }) => {
            if (activeTab === 0) {
              if (isFetchingContinue) {
                return (
                  <Skeleton
                    height={96}
                    loading
                    style={borders.rounded_8}
                    width="100%"
                  />
                );
              }
              return (
                <ContinueReadingCard
                  item={{
                    story: {
                      coverUri: item.story?.coverUri ?? '',
                      id: item.story?.id ?? '',
                      title: item.story?.title ?? 'Truyện',
                    },
                    lastReadChapter: item.chapter ? item.chapter.title : 'Đang đọc dở',
                    progress: item.position ?? item.lastReadPosition ?? 0.5,
                  } as any}
                  onPress={() => {
                    navigation.navigate(Paths.Reader, {
                      chapterId: item.chapter?.id ?? item.lastReadChapterId,
                      storyId: item.story?.id ?? item.storyId,
                    });
                  }}
                />
              );
            }

            // activeTab === 1 (Saved)
            if (isFetchingLibrary) {
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
                  if (item.id) {
                    navigation.navigate(Paths.StoryDetail, { storyId: item.id });
                  }
                }}
                onLongPress={handleRemoveFromLibrary}
                story={item as any}
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
