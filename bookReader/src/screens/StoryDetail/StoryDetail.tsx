import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks';
import { UserServices } from '@/services/users';
import { StoriesServices } from '@/services/stories';
import { LibraryServices } from '@/services/library';
import { ReportServices } from '@/services/reports';
import { parseApiError } from '@/services/auth';
import { LocalNotificationServices } from '@/services/notifications/localNotificationService';

import { AppIcon, AppText, Button, Cover, RatingStars, Tag, Skeleton } from '@/components/atoms';
import {
  AuthorBar,
  ChapterListItem,
  SectionHeader,
  StatItem,
  Tabs,
} from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

function StoryDetail({ navigation, route }: RootScreenProps<Paths.StoryDetail>) {
  const { storyId } = route.params;
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [draftStars, setDraftStars] = useState(5);
  const [draftContent, setDraftContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: apiDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['story-detail', storyId],
    queryFn: () => StoriesServices.getStoryDetail(storyId),
    enabled: !!storyId,
  });

  const { data: storyRatings } = useQuery({
    queryKey: ['story-ratings', storyId],
    queryFn: () => StoriesServices.getStoryRatings(storyId),
    enabled: !!storyId,
  });

  const reviews: any[] = Array.isArray(storyRatings?.items) ? storyRatings.items : [];
  const myReview = reviews.find((review) => review.user?.id === user?.id);

  const authorId = apiDetail?.author?.id;

  // Lấy hồ sơ tác giả thực tế để đọc trạng thái isFollowing
  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile', authorId],
    queryFn: () => UserServices.getProfile(authorId!),
    enabled: !!authorId,
  });

  const isFollowing = authorProfile?.isFollowing ?? false;

  const { data: readingProgress } = useQuery({
    queryKey: ['story-progress', storyId],
    queryFn: () => LibraryServices.getProgress(storyId),
    enabled: !!storyId,
  });

  if (isDetailLoading || !apiDetail) {
    return (
      <ScreenContainer
        onLeftPress={() => navigation.goBack()}
        showBack
        padded
        title={t('story_detail.title')}
      >
        <View style={[layout.col, gutters.gap_24, layout.itemsCenter, gutters.paddingTop_24, layout.flex_1]}>
          <Skeleton height={200} width={140} style={borders.rounded_12} loading />
          <Skeleton height={24} width={200} loading />
          <Skeleton height={16} width={120} loading />
          <View style={[layout.row, gutters.gap_12, gutters.marginTop_16, { width: '100%' }]}>
            <View style={{ flex: 1 }}>
              <Skeleton height={48} style={borders.rounded_8} loading />
            </View>
            <View style={{ flex: 1 }}>
              <Skeleton height={48} style={borders.rounded_8} loading />
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  const displayStory = {
    id: apiDetail.id,
    title: apiDetail.title,
    coverUri: apiDetail.coverUri || '',
    description: apiDetail.description || 'Chưa có tóm tắt.',
    genres: apiDetail.genres ?? ['Fantasy'],
    status: apiDetail.status ?? 'ongoing',
    author: {
      id: apiDetail.author?.id ?? '',
      name: apiDetail.author?.name ?? 'Tác giả',
      handle: apiDetail.author?.handle ?? '',
      avatarUri: apiDetail.author?.avatarUri ?? undefined,
    },
    rating: apiDetail.rating ?? 0,
    views: String(apiDetail.viewCount ?? 0),
    chaptersList: apiDetail.chapters ?? [],
  };

  async function handleToggleFollow() {
    if (!displayStory.author?.id) return;
    try {
      if (isFollowing) {
        await UserServices.unfollowUser(displayStory.author.id);
      } else {
        await UserServices.followUser(displayStory.author.id);
      }
      await queryClient.invalidateQueries({ queryKey: ['author-profile', displayStory.author.id] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Theo dõi tác giả thất bại.');
      Alert.alert('Thông báo', errorMsg);
    }
  }

  async function handleAddToLibrary() {
    if (!displayStory.id) return;
    try {
      await LibraryServices.setShelf(displayStory.id, 'SAVED');
      Alert.alert('Thành công', 'Đã thêm truyện vào mục Yêu thích của Thư viện cá nhân! Hãy chuyển sang Tab thứ 2 (Yêu thích) ở Thư viện để xem.');
      await queryClient.invalidateQueries({ queryKey: ['library'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Thêm vào thư viện thất bại.');
      Alert.alert('Lỗi', errorMsg);
    }
  }

  async function handleReportStory(reason: string) {
    if (!displayStory.id) return;
    try {
      await ReportServices.createReport({ storyId: displayStory.id, reason });
      Alert.alert('Thành công', 'Báo cáo vi phạm đã được gửi lên hệ thống kiểm duyệt.');
      LocalNotificationServices.addNotification(
        `Cám ơn bạn! Báo cáo vi phạm về tác phẩm "${displayStory.title}" đã được gửi lên hệ thống. Đội ngũ kiểm duyệt sẽ xử lý trong vòng 24h.`,
        'fire'
      );
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Gửi báo cáo thất bại.');
      Alert.alert('Lỗi', errorMsg);
    }
  }

  function promptReportStory() {
    Alert.alert(
      'Báo cáo vi phạm',
      'Chọn lý do báo cáo truyện này:',
      [
        { text: 'Nội dung bạo lực / nhạy cảm', onPress: () => handleReportStory('Nội dung bạo lực / nhạy cảm') },
        { text: 'Vi phạm bản quyền', onPress: () => handleReportStory('Vi phạm bản quyền') },
        { text: 'Spam / Lừa đảo', onPress: () => handleReportStory('Spam / Lừa đảo') },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  }

  function openReviewModal() {
    setDraftStars(myReview?.stars ?? 5);
    setDraftContent(myReview?.content ?? '');
    setReviewModalVisible(true);
  }

  async function handleSubmitReview() {
    if (!displayStory.id) return;
    setSubmittingReview(true);
    try {
      const res = await StoriesServices.rateStory(displayStory.id, draftStars, draftContent.trim());
      setReviewModalVisible(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['story-detail', storyId] }),
        queryClient.invalidateQueries({ queryKey: ['story-ratings', storyId] }),
      ]);
      Alert.alert('Thành công', `Cảm ơn bạn đã đánh giá ${draftStars} sao! (Điểm trung bình: ${res.rating}★)`);
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Gửi đánh giá thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const heroContainerStyle: any = [
    layout.itemsCenter,
    gutters.gap_16,
    gutters.paddingHorizontal_24,
    gutters.paddingTop_24,
  ];

  const genresStyle: any = [
    layout.row,
    layout.wrap,
    gutters.gap_8,
    layout.justifyCenter,
  ];

  const statsContainerStyle: any = [
    layout.row,
    layout.itemsCenter,
    layout.justifyAround,
    gutters.paddingVertical_16,
    gutters.marginHorizontal_24,
    borders.rounded_12,
    borders.w_1,
    { borderColor: colors.outlineVariant },
  ];

  const sectionStyle: any = [
    gutters.paddingHorizontal_24,
    gutters.gap_12,
  ];

  const tabsContainerStyle: any = [
    gutters.paddingHorizontal_24,
  ];

  const tabContentStyle: any = [
    gutters.paddingHorizontal_24,
    gutters.gap_12,
  ];

  const ctaContainerStyle: any = [
    layout.absolute,
    layout.bottom0,
    layout.left0,
    layout.right0,
    layout.row,
    layout.itemsCenter,
    layout.justifyBetween,
    backgrounds.surface,
    borders.wTop_1,
    borders.surfaceVariant,
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_16,
    gutters.gap_16,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer
      onLeftPress={() => {
        navigation.goBack();
      }}
      onRightPress={promptReportStory}
      rightIcon="flag"
      padded={false}
      scroll={false}
      showBack
      title={t('story_detail.title')}
    >
      <View style={[layout.flex_1, layout.relative]}>
        <ScrollView
          contentContainerStyle={[gutters.gap_24, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          style={layout.flex_1}
        >
          <View style={heroContainerStyle}>
            <Cover uri={displayStory.coverUri} width={120} />
            <View style={genresStyle}>
              {displayStory.genres?.map((genre: string, index: number) => (
                <Tag key={`${genre}-${index}`} label={genre} tone="secondary" />
              ))}
              {displayStory.status ? (
                <Tag
                  label={displayStory.status === 'completed' ? 'Completed' : 'Ongoing'}
                  tone="primary"
                />
              ) : undefined}
            </View>
            <AppText style={{ textAlign: 'center' }} variant="headlineLg">
              {displayStory.title}
            </AppText>
            <AuthorBar
              author={displayStory.author}
              following={isFollowing}
              onToggleFollow={handleToggleFollow}
            />
          </View>

          <View style={statsContainerStyle}>
            <Pressable onPress={openReviewModal}>
              <StatItem
                label={t('story_detail.rating_label')}
                value={<RatingStars value={displayStory.rating ?? 0} />}
              />
            </Pressable>
            <View
              style={{
                borderColor: colors.outlineVariant,
                borderLeftWidth: 1,
                height: 32,
              }}
            />
            <StatItem label={t('story_detail.views_label')} value={displayStory.views ?? '0'} />
            <View
              style={{
                borderColor: colors.outlineVariant,
                borderLeftWidth: 1,
                height: 32,
              }}
            />
            <StatItem label={t('story_detail.chapters_label')} value={String(displayStory.chaptersList?.length ?? 0)} />
          </View>

          <View style={sectionStyle}>
            <SectionHeader title={t('story_detail.synopsis_title')} />
            <AppText color="onSurfaceVariant" variant="bodyLg">
              {displayStory.description}
            </AppText>
          </View>

          <View style={tabsContainerStyle}>
            <Tabs
              activeIndex={activeTab}
              onChange={setActiveTab}
              tabs={[
                t('story_detail.chapters_tab'),
                t('story_detail.reviews_tab'),
              ]}
            />
          </View>

          {activeTab === 0 ? (
            <View style={tabContentStyle}>
              {displayStory.chaptersList && displayStory.chaptersList.length > 0 ? (
                displayStory.chaptersList.map((chapter: any) => (
                  <ChapterListItem
                    chapter={chapter}
                    key={chapter.id}
                    onPress={() => {
                      navigation.navigate(Paths.Reader, { chapterId: chapter.id, storyId: displayStory.id });
                    }}
                  />
                ))
              ) : (
                <AppText color="onSurfaceVariant" variant="bodyMd">
                  Chưa có chương nào được tải lên.
                </AppText>
              )}
            </View>
          ) : (
            <View style={tabContentStyle}>
              <Button
                label={myReview ? t('story_detail.edit_review') : t('story_detail.write_review')}
                onPress={openReviewModal}
                variant="outlined"
              />
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <View
                    key={review.id}
                    style={[
                      gutters.gap_4,
                      gutters.padding_12,
                      borders.rounded_12,
                      borders.w_1,
                      { borderColor: colors.outlineVariant },
                    ]}
                  >
                    <View style={[layout.row, layout.itemsCenter, layout.justifyBetween]}>
                      <AppText color="onSurface" variant="labelMd">
                        {review.user?.name ?? 'Độc giả'}
                      </AppText>
                      <RatingStars value={review.stars ?? 0} />
                    </View>
                    {review.content ? (
                      <AppText color="onSurfaceVariant" variant="bodyMd">
                        {review.content}
                      </AppText>
                    ) : undefined}
                  </View>
                ))
              ) : (
                <AppText color="onSurfaceVariant" variant="bodyMd">
                  {t('story_detail.no_reviews')}
                </AppText>
              )}
            </View>
          )}
        </ScrollView>

        {(readingProgress as any)?.chapter ? (
          <View style={[layout.itemsCenter, gutters.paddingVertical_8, { backgroundColor: colors.surfaceVariant, marginHorizontal: 24, borderRadius: 8, marginBottom: 8 }]}>
            <AppText color="primary" variant="bodyMd" style={{ fontWeight: '600' }}>
              📖 {t('story_detail.currently_reading')}: {(readingProgress as any).chapter.title}
            </AppText>
          </View>
        ) : null}

        <View style={ctaContainerStyle}>
          <Pressable
            onPress={handleAddToLibrary}
            style={({ pressed }) => [
              layout.justifyCenter,
              layout.itemsCenter,
              borders.rounded_12,
              borders.w_1,
              gutters.padding_8,
              {
                borderColor: colors.outlineVariant,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <AppIcon name="bookmark" color="primary" size={24} />
            <AppText color="onSurfaceVariant" variant="labelSm">
              {t('story_detail.add_to_library')}
            </AppText>
          </Pressable>
          <View style={layout.flex_1}>
            <Button
              label={t('story_detail.read_now')}
              onPress={() => {
                const targetChapterId = (readingProgress as any)?.chapterId ?? displayStory.chaptersList?.[0]?.id;
                navigation.navigate(Paths.Reader, { chapterId: targetChapterId, storyId: displayStory.id });
              }}
              variant="filled"
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          onRequestClose={() => setReviewModalVisible(false)}
          transparent
          visible={reviewModalVisible}
        >
          <Pressable
            onPress={() => setReviewModalVisible(false)}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'flex-end' }}
          >
            <Pressable
              onPress={() => {}}
              style={[
                backgrounds.surface,
                gutters.padding_24,
                gutters.gap_16,
                { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
              ]}
            >
              <View style={[layout.row, layout.itemsCenter, layout.justifyBetween]}>
                <AppText color="onSurface" variant="headlineMd">
                  {myReview ? t('story_detail.edit_review') : t('story_detail.write_review')}
                </AppText>
                <Pressable onPress={() => setReviewModalVisible(false)}>
                  <AppText color="primary" variant="labelMd">
                    {t('reader.close')}
                  </AppText>
                </Pressable>
              </View>

              <View style={[layout.row, layout.justifyCenter, gutters.gap_8]}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable hitSlop={8} key={star} onPress={() => setDraftStars(star)}>
                    <AppIcon
                      color={star <= draftStars ? 'tertiary' : 'onSurfaceVariant'}
                      name="star"
                      size={32}
                    />
                  </Pressable>
                ))}
              </View>

              <TextInput
                multiline
                numberOfLines={4}
                onChangeText={setDraftContent}
                placeholder={t('story_detail.review_placeholder')}
                placeholderTextColor={colors.onSurfaceVariant}
                style={[
                  gutters.padding_12,
                  borders.rounded_12,
                  borders.w_1,
                  {
                    borderColor: colors.outlineVariant,
                    color: colors.onSurface,
                    minHeight: 96,
                    textAlignVertical: 'top',
                  },
                ]}
                value={draftContent}
              />

              <Button
                disabled={submittingReview}
                label={submittingReview ? '...' : t('story_detail.submit_review')}
                onPress={handleSubmitReview}
                variant="filled"
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

export default StoryDetail;
