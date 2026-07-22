import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { useUser } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { UserServices } from '@/services/users';
import { StoriesServices } from '@/services/stories';
import { LibraryServices } from '@/services/library';
import { ReportServices } from '@/services/reports';
import { parseApiError } from '@/services/auth';
import { LocalNotificationServices } from '@/services/notifications/localNotificationService';

import { AppIcon, AppText, Avatar, Button, Cover, RatingStars, Tag, Skeleton } from '@/components/atoms';
import {
  AuthorBar,
  ChapterListItem,
  ReportDialog,
  SectionHeader,
  StatItem,
  Tabs,
} from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

function StoryDetail({ navigation, route }: RootScreenProps<Paths.StoryDetail>) {
  const { storyId } = route.params;
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  const { data: apiDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['story-detail', storyId],
    queryFn: () => StoriesServices.getStoryDetail(storyId),
    enabled: !!storyId,
  });

  const authorId = apiDetail?.author?.id;

  // Lấy hồ sơ tác giả thực tế để đọc trạng thái isFollowing
  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile', authorId],
    queryFn: () => UserServices.getProfile(authorId!),
    enabled: !!authorId,
  });

  const isFollowing = authorProfile?.isFollowing ?? false;

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['story-reviews', storyId],
    queryFn: () => StoriesServices.getReviews(storyId),
    enabled: activeTab === 1,
  });

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['author-profile', displayStory.author.id] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', displayStory.author.id] }),
      ]);
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
    setReporting(true);
    try {
      await ReportServices.createReport({ storyId: displayStory.id, reason });
      setReportVisible(false);
      Alert.alert('Thành công', 'Báo cáo vi phạm đã được gửi lên hệ thống kiểm duyệt.');
      LocalNotificationServices.addNotification(
        `Cám ơn bạn! Báo cáo vi phạm về tác phẩm "${displayStory.title}" đã được gửi lên hệ thống. Đội ngũ kiểm duyệt sẽ xử lý trong vòng 24h.`,
        'fire'
      );
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Gửi báo cáo thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setReporting(false);
    }
  }

  function openReview() {
    setReviewContent(apiDetail.myReview?.content ?? '');
    setReviewStars(apiDetail.myReview?.stars ?? apiDetail.myRating ?? 5);
    setReviewVisible(true);
  }

  async function handleSaveReview() {
    if (!displayStory.id) return;
    const content = reviewContent.trim();
    if (!content) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập nhận xét cho bài đánh giá.');
      return;
    }
    setSavingReview(true);
    try {
      await StoriesServices.saveReview(displayStory.id, {
        content,
        stars: reviewStars,
      });
      setReviewVisible(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['story-detail', storyId] }),
        queryClient.invalidateQueries({ queryKey: ['story-reviews', storyId] }),
        queryClient.invalidateQueries({ queryKey: ['stories'] }),
      ]);
      Alert.alert('Thành công', 'Bài đánh giá của bạn đã được lưu.');
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Không thể lưu bài đánh giá.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setSavingReview(false);
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
      onRightPress={() => setReportVisible(true)}
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
              onPress={() => navigation.navigate(Paths.UserProfile, { userId: displayStory.author.id })}
              onToggleFollow={user?.id === displayStory.author.id ? undefined : handleToggleFollow}
            />
          </View>

          <View style={statsContainerStyle}>
            <Pressable onPress={openReview}>
              <StatItem
                label={t('story_detail.rating_label')}
                value={<RatingStars count={apiDetail.ratingCount ?? 0} value={displayStory.rating ?? 0} />}
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
                label={apiDetail.myReview?.content ? 'Sửa đánh giá của bạn' : 'Viết đánh giá'}
                onPress={openReview}
                variant="tonal"
              />
              {reviewsLoading ? (
                <Skeleton height={96} loading />
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <View
                    key={review.id}
                    style={{
                      backgroundColor: colors.surfaceContainerLowest,
                      borderColor: colors.outlineVariant,
                      borderRadius: 12,
                      borderWidth: 1,
                      padding: 14,
                    }}
                  >
                    <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
                      <Pressable
                        onPress={() => navigation.navigate(Paths.UserProfile, { userId: review.user.id })}
                      >
                        <Avatar size={40} uri={review.user.avatarUri ?? undefined} />
                      </Pressable>
                      <Pressable
                        onPress={() => navigation.navigate(Paths.UserProfile, { userId: review.user.id })}
                        style={layout.flex_1}
                      >
                        <AppText color="onSurface" variant="labelMd">
                          {review.user.name}
                        </AppText>
                        <AppText color="onSurfaceVariant" variant="labelSm">
                          {review.user.handle ? `@${review.user.handle.replace(/^@/, '')}` : 'Độc giả'}
                        </AppText>
                      </Pressable>
                      <RatingStars value={review.stars} />
                    </View>
                    <AppText color="onSurface" style={gutters.marginTop_12} variant="bodyMd">
                      {review.content}
                    </AppText>
                    <AppText color="onSurfaceVariant" style={gutters.marginTop_8} variant="labelSm">
                      {new Date(review.updatedAt).toLocaleDateString('vi-VN')}
                    </AppText>
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

        {reportVisible ? (
          <ReportDialog
            loading={reporting}
            onClose={() => setReportVisible(false)}
            onSubmit={handleReportStory}
            reasons={[
              'Nội dung bạo lực hoặc nhạy cảm',
              'Vi phạm bản quyền',
              'Spam hoặc lừa đảo',
            ]}
            targetLabel={`truyện “${displayStory.title}”`}
            visible
          />
        ) : undefined}

        <Modal
          animationType="fade"
          onRequestClose={() => setReviewVisible(false)}
          transparent
          visible={reviewVisible}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.55)',
              flex: 1,
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: colors.surfaceContainerLowest,
                borderRadius: 20,
                maxWidth: 420,
                padding: 24,
                width: '100%',
              }}
            >
              <AppText color="onSurface" variant="headlineMd">
                {apiDetail.myReview?.content ? 'Sửa bài đánh giá' : 'Viết bài đánh giá'}
              </AppText>
              <AppText color="onSurfaceVariant" style={gutters.marginTop_8} variant="bodyMd">
                Chọn số sao và chia sẻ cảm nhận của bạn về truyện.
              </AppText>
              <View style={[layout.row, gutters.gap_8, gutters.marginTop_16]}>
                {[1, 2, 3, 4, 5].map((stars) => (
                  <Pressable key={stars} onPress={() => setReviewStars(stars)}>
                    <AppIcon
                      color={stars <= reviewStars ? 'tertiary' : 'outlineVariant'}
                      name="star"
                      size={32}
                    />
                  </Pressable>
                ))}
              </View>
              <TextInput
                maxLength={1000}
                multiline
                onChangeText={setReviewContent}
                placeholder="Nhập nhận xét của bạn..."
                placeholderTextColor={colors.onSurfaceVariant}
                style={{
                  borderColor: colors.outlineVariant,
                  borderRadius: 10,
                  borderWidth: 1,
                  color: colors.onSurface,
                  height: 120,
                  marginTop: 16,
                  padding: 12,
                  textAlignVertical: 'top',
                }}
                value={reviewContent}
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <View style={layout.flex_1}>
                  <Button
                    fullWidth
                    label="Hủy"
                    onPress={() => setReviewVisible(false)}
                    variant="outlined"
                  />
                </View>
                <View style={layout.flex_1}>
                  <Button
                    disabled={savingReview || !reviewContent.trim()}
                    fullWidth
                    label={savingReview ? 'Đang lưu...' : 'Lưu đánh giá'}
                    onPress={handleSaveReview}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

export default StoryDetail;
