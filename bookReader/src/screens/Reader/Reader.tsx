/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-magic-numbers */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { ChaptersServices } from '@/services/chapters';
import { LibraryServices } from '@/services/library';
import { parseApiError } from '@/services/auth';
import { ReportServices } from '@/services/reports';
import { LocalNotificationServices } from '@/services/notifications/localNotificationService';

import { AppIcon, AppText, Button, ProgressBar } from '@/components/atoms';
import { ScreenContainer } from '@/components/templates';


function Reader({ navigation, route }: RootScreenProps<Paths.Reader>) {
  const { chapterId, storyId } = route.params ?? {};
  const {
    backgrounds,
    borders,
    changeTheme,
    colors,
    gutters,
    layout,
    variant,
  } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(chapterId);
  const [unlocking, setUnlocking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Tự động lưu vị trí đọc dở lên server (PUT /library/:storyId/progress)
  useEffect(() => {
    if (storyId && activeChapterId) {
      LibraryServices.upsertProgress(storyId, activeChapterId, 0)
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ['story-progress', storyId] });
          void queryClient.invalidateQueries({ queryKey: ['library'] });
          void queryClient.invalidateQueries({ queryKey: ['continue-reading'] });
        })
        .catch(() => {});
    }
  }, [storyId, activeChapterId, queryClient]);

  const { data: chapterDetail, isLoading } = useQuery({
    queryKey: ['chapter-detail', activeChapterId],
    queryFn: () => ChaptersServices.getChapterDetail(activeChapterId!),
    enabled: !!activeChapterId,
  });

  const { data: commentsList, isLoading: isFetchingComments } = useQuery({
    queryKey: ['chapter-comments', activeChapterId],
    queryFn: () => ChaptersServices.getComments(activeChapterId!),
    enabled: !!activeChapterId,
  });

  async function handleUnlockChapter() {
    if (!activeChapterId) return;
    setUnlocking(true);
    try {
      const res = await ChaptersServices.unlockChapter(activeChapterId);
      Alert.alert('Thành công', `Đã mở khóa chương thành công! Số xu còn lại: ${res.coinBalance}`);
      await queryClient.invalidateQueries({ queryKey: ['chapter-detail', activeChapterId] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Mở khóa chương thất bại.');
      Alert.alert('Thông báo', errorMsg);
    } finally {
      setUnlocking(false);
    }
  }

  async function handleSendComment() {
    if (!commentText.trim() || !activeChapterId) return;
    setPostingComment(true);
    try {
      await ChaptersServices.createComment(activeChapterId, { content: commentText.trim(), paragraphIndex: 0 });
      setCommentText('');
      await queryClient.invalidateQueries({ queryKey: ['chapter-comments', activeChapterId] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Bình luận thất bại.');
      Alert.alert('Thông báo', errorMsg);
    } finally {
      setPostingComment(false);
    }
  }

  async function handleReportComment(commentId: string, commenterName: string) {
    Alert.alert(
      'Báo cáo bình luận',
      `Chọn lý do báo cáo bình luận của ${commenterName}:`,
      [
        {
          text: 'Nội dung phản cảm / bạo lực',
          onPress: () => submitCommentReport(commentId, commenterName, 'Nội dung phản cảm / bạo lực'),
        },
        {
          text: 'Spam / Quảng cáo',
          onPress: () => submitCommentReport(commentId, commenterName, 'Spam / Quảng cáo'),
        },
        {
          text: 'Quấy rối / Công kích',
          onPress: () => submitCommentReport(commentId, commenterName, 'Quấy rối / Công kích'),
        },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  }

  async function submitCommentReport(commentId: string, commenterName: string, reason: string) {
    try {
      await ReportServices.createReport({ commentId, reason });
      Alert.alert('Thành công', 'Báo cáo vi phạm bình luận đã được gửi lên hệ thống kiểm duyệt.');
      LocalNotificationServices.addNotification(
        `Cám ơn bạn! Báo cáo vi phạm về bình luận của "${commenterName}" đã được gửi lên hệ thống. Đội ngũ kiểm duyệt sẽ xử lý trong vòng 24h.`,
        'fire'
      );
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Gửi báo cáo thất bại.');
      Alert.alert('Lỗi', errorMsg);
    }
  }

  const title = chapterDetail?.title ?? 'Đang tải...';
  const isLocked = chapterDetail?.locked ?? false;
  const contentText = chapterDetail?.content ?? '';

  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
  };

  const handlePrevious = () => {
    if (chapterDetail?.previousChapterId) {
      setActiveChapterId(chapterDetail.previousChapterId);
    }
  };

  const handleNext = () => {
    if (chapterDetail?.nextChapterId) {
      setActiveChapterId(chapterDetail.nextChapterId);
    }
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const headerStyle: any = [
    layout.absolute,
    layout.top0,
    layout.left0,
    layout.right0,
    layout.row,
    layout.itemsCenter,
    layout.justifyBetween,
    backgrounds.surface,
    borders.wBottom_1,
    { borderColor: colors.outlineVariant, height: 56, zIndex: 10 },
    gutters.paddingHorizontal_24,
  ];

  const bottomStyle: any = [
    layout.absolute,
    layout.bottom0,
    layout.left0,
    layout.right0,
    backgrounds.surface,
    borders.wTop_1,
    { borderColor: colors.outlineVariant, zIndex: 10 },
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_16,
    gutters.gap_16,
  ];

  const modalContainerStyle: any = [
    layout.flex_1,
    layout.justifyEnd,
    { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  ];

  const sheetStyle: any = [
    backgrounds.surface,
    borders.roundedTop_16,
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_24,
    gutters.gap_24,
  ];

  const rowStyle: any = [layout.row, layout.itemsCenter, layout.justifyBetween];

  const buttonAdjustStyle: any = [
    layout.justifyCenter,
    layout.itemsCenter,
    borders.rounded_8,
    borders.w_1,
    { borderColor: colors.outline, height: 44, width: 44 },
  ];

  const themeOptionStyle: any = [
    layout.flex_1,
    layout.itemsCenter,
    gutters.paddingVertical_12,
    borders.rounded_8,
    borders.w_1,
    { borderColor: colors.outline },
  ];

  const themeOptionActiveStyle: any = [
    { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer padded={false} scroll={true} showHeader={false}>
      <View style={[layout.flex_1, { backgroundColor: colors.surface }]}>
        <Pressable onPress={toggleControls} style={layout.flex_1}>
          <ScrollView
            contentContainerStyle={[
              gutters.paddingHorizontal_24,
              {
                alignSelf: 'center',
                maxWidth: 600,
                paddingBottom: 120,
                paddingTop: 80,
                width: '100%',
              },
            ]}
            showsVerticalScrollIndicator={false}
            style={layout.flex_1}
          >
            <AppText
              color="onSurface"
              style={{ fontSize, lineHeight: fontSize * 1.8 }}
              variant="readingText"
            >
              {title}
              {'\n\n'}
            </AppText>

            {isLoading ? (
              <AppText color="onSurfaceVariant" variant="bodyMd">
                Đang tải nội dung chương...
              </AppText>
            ) : isLocked ? (
              <View style={{ backgroundColor: colors.surfaceVariant, borderRadius: 16, padding: 24, alignItems: 'center' }}>
                <AppIcon color="primary" name="lock" size={40} />
                <AppText color="onSurface" variant="headlineMd" style={{ marginVertical: 12, textAlign: 'center' }}>
                  Chương VIP chưa mở khóa
                </AppText>
                <AppText color="onSurfaceVariant" variant="bodyMd" style={{ textAlign: 'center', marginBottom: 20 }}>
                  Bạn cần {chapterDetail?.coinPrice ?? 0} xu để đọc nội dung chương này.
                </AppText>
                <Button
                  label={unlocking ? 'Đang mở khóa...' : `Mở khóa ngay (${chapterDetail?.coinPrice ?? 0} xu)`}
                  onPress={handleUnlockChapter}
                  disabled={unlocking}
                />
              </View>
            ) : (
              <View>
                <AppText
                  color="onSurface"
                  style={{ fontSize, lineHeight: fontSize * 1.8 }}
                  variant="readingText"
                >
                  {contentText}
                </AppText>

                {/* Inline Comment Section */}
                {controlsVisible && (
                  <View style={{ marginTop: 40, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 20 }}>
                    <Pressable
                      onPress={() => setCommentsVisible(true)}
                      style={({ pressed }) => [
                        layout.row,
                        layout.itemsCenter,
                        layout.justifyCenter,
                        gutters.gap_8,
                        borders.rounded_12,
                        {
                          backgroundColor: colors.surfaceVariant,
                          paddingVertical: 12,
                          paddingHorizontal: 24,
                          width: '100%',
                          opacity: pressed ? 0.8 : 1,
                        }
                      ]}
                    >
                      <AppIcon name="chat" color="primary" size={20} />
                      <AppText color="primary" variant="labelMd" style={{ fontWeight: '600' }}>
                        Xem bình luận ({commentsList?.length ?? 0})
                      </AppText>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Pressable>

        {/* Overlay Header */}
        {controlsVisible ? (
          <View style={headerStyle}>
            <Pressable
              hitSlop={8}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <AppIcon color="primary" name="arrow_back" />
            </Pressable>
            <AppText
              color="onSurface"
              numberOfLines={1}
              style={{ flex: 1, marginHorizontal: 16, textAlign: 'center' }}
              variant="headlineMd"
            >
              {title}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <Pressable hitSlop={8} onPress={() => setCommentsVisible(true)}>
                <AppIcon color="primary" name="chat" />
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={() => {
                  setSettingsVisible(true);
                }}
              >
                <AppIcon color="primary" name="settings" />
              </Pressable>
            </View>
          </View>
        ) : undefined}

        {/* Overlay Bottom Bar */}
        {controlsVisible ? (
          <View style={bottomStyle}>
            <View
              style={[
                layout.row,
                layout.itemsCenter,
                layout.justifyBetween,
                gutters.gap_16,
              ]}
            >
              <View style={layout.flex_1}>
                <Button
                  disabled={!chapterDetail?.previousChapterId}
                  label={t('reader.prev_chapter')}
                  onPress={handlePrevious}
                  variant="outlined"
                />
              </View>
              <View style={layout.flex_1}>
                <Button
                  disabled={!chapterDetail?.nextChapterId}
                  label={t('reader.next_chapter')}
                  onPress={handleNext}
                  variant="filled"
                />
              </View>
            </View>
          </View>
        ) : undefined}

        {/* ReaderSettings Sheet Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => {
            setSettingsVisible(false);
          }}
          transparent
          visible={settingsVisible}
        >
          <Pressable
            onPress={() => {
              setSettingsVisible(false);
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={modalContainerStyle}>
            <View style={sheetStyle}>
              <View style={rowStyle}>
                <AppText color="onSurface" variant="headlineMd">
                  {t('reader.settings_title')}
                </AppText>
                <Pressable
                  onPress={() => {
                    setSettingsVisible(false);
                  }}
                >
                  <AppText color="primary" variant="labelMd">
                    {t('reader.close')}
                  </AppText>
                </Pressable>
              </View>

              {/* Adjust font size */}
              <View style={rowStyle}>
                <AppText color="onSurface" variant="labelMd">
                  {t('reader.font_size')} ({fontSize}px)
                </AppText>
                <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
                  <Pressable
                    disabled={fontSize <= 14}
                    onPress={() => {
                      setFontSize(Math.max(14, fontSize - 2));
                    }}
                    style={[
                      buttonAdjustStyle,
                      fontSize <= 14 && { opacity: 0.5 },
                    ]}
                  >
                    <AppText color="onSurface" variant="headlineMd">
                      -
                    </AppText>
                  </Pressable>
                  <Pressable
                    disabled={fontSize >= 32}
                    onPress={() => {
                      setFontSize(Math.min(32, fontSize + 2));
                    }}
                    style={[
                      buttonAdjustStyle,
                      fontSize >= 32 && { opacity: 0.5 },
                    ]}
                  >
                    <AppText color="onSurface" variant="headlineMd">
                      +
                    </AppText>
                  </Pressable>
                </View>
              </View>

              {/* Adjust theme */}
              <View style={rowStyle}>
                <AppText color="onSurface" variant="labelMd">
                  {t('reader.theme')}
                </AppText>
                <View
                  style={[
                    layout.row,
                    layout.flex_1,
                    gutters.gap_12,
                    { marginLeft: 24 },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      changeTheme('default');
                    }}
                    style={[
                      themeOptionStyle,
                      variant === 'default' && themeOptionActiveStyle,
                    ]}
                  >
                    <AppText
                      color={variant === 'default' ? 'primary' : 'onSurface'}
                      variant="labelSm"
                    >
                      {t('reader.theme_light')}
                    </AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      changeTheme('dark');
                    }}
                    style={[
                      themeOptionStyle,
                      variant === 'dark' && themeOptionActiveStyle,
                    ]}
                  >
                    <AppText
                      color={variant === 'dark' ? 'primary' : 'onSurface'}
                      variant="labelSm"
                    >
                      {t('reader.theme_dark')}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Inline Comments Sheet Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => setCommentsVisible(false)}
          transparent
          visible={commentsVisible}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            onPress={() => setCommentsVisible(false)}
          >
            <Pressable
              style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}
              onPress={() => {}}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <AppText color="onSurface" variant="headlineMd">
                  Bình luận ({commentsList?.length ?? 0})
                </AppText>
                <Pressable onPress={() => setCommentsVisible(false)}>
                  <AppText color="primary" variant="labelMd">Đóng</AppText>
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {Array.isArray(commentsList) && commentsList.length > 0 ? (
                  commentsList.map((cmt: any) => (
                    <View key={cmt.id} style={{ backgroundColor: '#F4F4F6', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <AppText color="primary" variant="labelMd">
                          {cmt.user?.name ?? 'Độc giả'} {cmt.user?.handle ? `@${cmt.user.handle}` : ''}
                        </AppText>
                        <Pressable
                          hitSlop={8}
                          onPress={() => handleReportComment(cmt.id, cmt.user?.name ?? 'Độc giả')}
                          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                          <AppIcon name="flag" color="onSurfaceVariant" size={16} />
                        </Pressable>
                      </View>
                      <AppText color="onSurface" variant="bodyMd">
                        {cmt.content}
                      </AppText>
                    </View>
                  ))
                ) : (
                  <AppText color="onSurfaceVariant" variant="bodyMd" style={{ fontStyle: 'italic', marginVertical: 12 }}>
                    Chưa có bình luận nào. Hãy gửi bình luận đầu tiên!
                  </AppText>
                )}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, alignItems: 'center' }}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Nhập ý kiến của bạn..."
                  placeholderTextColor="#999"
                  style={{
                    flex: 1,
                    backgroundColor: '#F4F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                />
                <Button
                  label={postingComment ? '...' : 'Gửi'}
                  onPress={handleSendComment}
                  disabled={postingComment || !commentText.trim()}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

export default Reader;
