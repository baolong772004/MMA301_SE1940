/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-magic-numbers */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@/theme';
import { FontFamily } from '@/theme/typography';
import { StoriesServices } from '@/services/stories';
import { ChaptersServices } from '@/services/chapters';
import { parseApiError } from '@/services/auth';
import * as DocumentPicker from 'expo-document-picker';
import { ImportServices } from '@/services/imports';

import { AppIcon, AppText, Button, Cover, Tag } from '@/components/atoms';
import { SectionHeader, StatCard } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';


function Write() {
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  // Story Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('Fantasy, Adventure');
  const [coverUri, setCoverUri] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [loading, setLoading] = useState(false);

  // Chapter Form / Modal State
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [coinPrice, setCoinPrice] = useState('0');

  const { data: myStories, isLoading: isFetchingMyStories } = useQuery({
    queryKey: ['my-stories'],
    queryFn: () => StoriesServices.getMyStories(),
  });

  const { data: currentStoryDetail } = useQuery({
    queryKey: ['story-detail', editingStoryId],
    queryFn: () => StoriesServices.getStoryDetail(editingStoryId!),
    enabled: !!editingStoryId,
  });

  const [isImporting, setIsImporting] = useState(false);

  async function handleImportFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/epub+zip', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      if (!file.uri) return;

      setIsImporting(true);
      await ImportServices.importFile(file.uri, file.name, file.mimeType ?? 'application/octet-stream');
      Alert.alert('Thành công', 'Đã tải lên và nhập sách thành công! Đội ngũ kiểm duyệt sẽ xử lý tác phẩm.');
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Nhập sách thất bại. Vui lòng thử lại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setIsImporting(false);
    }
  }

  function openCreateModal() {
    setEditingStoryId(null);
    setTitle('');
    setDescription('');
    setGenres('Fantasy, Adventure');
    setCoverUri('');
    setStatus('ongoing');
    setModalVisible(true);
  }

  function openEditModal(work: any) {
    setEditingStoryId(work.id);
    setTitle(work.title ?? '');
    setDescription(work.description ?? '');
    setGenres(Array.isArray(work.genres) ? work.genres.join(', ') : 'Fantasy, Adventure');
    setCoverUri(work.coverUri ?? '');
    setStatus(work.status === 'completed' ? 'completed' : 'ongoing');
    setModalVisible(true);
  }

  function openAddChapterModal() {
    setEditingChapterId(null);
    setChapterTitle('');
    setChapterContent('');
    setIsVip(false);
    setCoinPrice('0');
    setChapterModalVisible(true);
  }

  async function openEditChapterModal(chap: any) {
    setEditingChapterId(chap.id);
    setChapterTitle(chap.title ?? '');
    setIsVip(chap.isVip ?? false);
    setCoinPrice(String(chap.coinPrice ?? 0));
    setChapterModalVisible(true);

    try {
      const detail = await ChaptersServices.getChapterDetail(chap.id);
      setChapterContent(detail.content ?? '');
    } catch {
      setChapterContent('');
    }
  }

  async function handleSaveStory() {
    if (!title.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề truyện');
      return;
    }
    setLoading(true);
    try {
      const genreList = genres.split(',').map((g) => g.trim()).filter(Boolean);

      const finalCoverUri = coverUri.trim() || `https://picsum.photos/seed/${encodeURIComponent(title.trim())}/400/600`;

      if (editingStoryId) {
        await StoriesServices.updateStory(editingStoryId, {
          title: title.trim(),
          description: description.trim() || undefined,
          genres: genreList.length > 0 ? genreList : ['Fantasy'],
          coverUri: finalCoverUri,
          status,
        });
        Alert.alert('Thành công', 'Đã cập nhật thông tin truyện!');
      } else {
        await StoriesServices.createStory({
          title: title.trim(),
          description: description.trim() || undefined,
          genres: genreList.length > 0 ? genreList : ['Fantasy'],
          coverUri: finalCoverUri,
          status,
        });
        Alert.alert('Thành công', 'Đã tạo truyện mới! Bài viết sẽ chờ duyệt trước khi hiển thị công khai.');
      }

      setModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, editingStoryId ? 'Cập nhật thất bại.' : 'Tạo truyện thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStory() {
    if (!editingStoryId) return;
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa bộ truyện này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await StoriesServices.deleteStory(editingStoryId);
            Alert.alert('Thành công', 'Đã xóa truyện!');
            setModalVisible(false);
            await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
          } catch (err: unknown) {
            const errorMsg = await parseApiError(err, 'Xóa truyện thất bại.');
            Alert.alert('Lỗi', errorMsg);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  async function handleSaveChapter() {
    if (!chapterTitle.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề chương');
      return;
    }
    setLoading(true);
    try {
      const price = parseInt(coinPrice, 10) || 0;

      if (editingChapterId) {
        // Cập nhật / Auto-save chương (PATCH /chapters/:id)
        await ChaptersServices.updateChapter(editingChapterId, {
          title: chapterTitle.trim(),
          content: chapterContent,
          isVip,
          coinPrice: price,
        });
        Alert.alert('Thành công', 'Đã lưu nháp / cập nhật chương thành công!');
      } else if (editingStoryId) {
        // Thêm chương mới (POST /stories/:id/chapters)
        await StoriesServices.createChapter(editingStoryId, {
          title: chapterTitle.trim(),
          content: chapterContent,
          isVip,
          coinPrice: price,
        });
        Alert.alert('Thành công', 'Đã tạo chương mới!');
      }

      setChapterModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['story-detail', editingStoryId] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, editingChapterId ? 'Cập nhật chương thất bại.' : 'Tạo chương thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteChapter() {
    if (!editingChapterId) return;
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa chương này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            // Xóa chương (DELETE /chapters/:id)
            await ChaptersServices.deleteChapter(editingChapterId);
            Alert.alert('Thành công', 'Đã xóa chương thành công!');
            setChapterModalVisible(false);
            await queryClient.invalidateQueries({ queryKey: ['story-detail', editingStoryId] });
          } catch (err: unknown) {
            const errorMsg = await parseApiError(err, 'Xóa chương thất bại.');
            Alert.alert('Lỗi', errorMsg);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  async function handlePublishChapter() {
    if (!editingChapterId) return;
    setLoading(true);
    try {
      // Xuất bản chương (POST /chapters/:id/publish)
      await ChaptersServices.publishChapter(editingChapterId);
      Alert.alert('Thành công', 'Đã xuất bản chương truyện!');
      setChapterModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['story-detail', editingStoryId] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Xuất bản chương thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const totalWorks = Array.isArray(myStories) ? myStories.length : 0;
  const totalViews = Array.isArray(myStories)
    ? myStories.reduce((acc: number, cur: any) => acc + (cur.viewCount ?? 0), 0)
    : 0;

  const dynamicStats = [
    {
      id: 's1',
      icon: 'auto_stories',
      labelKey: 'writer_studio.reads',
      value: String(totalViews),
    },
    {
      id: 's2',
      icon: 'book',
      labelKey: 'writer_studio.my_works',
      value: String(totalWorks),
    },
  ];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const statsContainerStyle: any = [
    layout.row,
    gutters.gap_12,
    gutters.marginVertical_16,
  ];

  const worksListStyle: any = [
    layout.col,
    gutters.gap_16,
    gutters.marginTop_16,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer scroll title={t('writer_studio.title')}>
      <View style={statsContainerStyle}>
        {dynamicStats.map((stat) => (
          <StatCard
            icon={stat.icon}
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
          />
        ))}
      </View>

      <SectionHeader title={t('writer_studio.my_works')} />

      <View style={worksListStyle}>
        {Array.isArray(myStories) && myStories.length > 0 ? (
          myStories.map((work: any) => (
            <Pressable
              key={work.id}
              onPress={() => openEditModal(work)}
              style={({ pressed }) => [
                layout.row,
                layout.itemsCenter,
                backgrounds.surface,
                borders.rounded_12,
                borders.w_1,
                { borderColor: colors.outlineVariant, opacity: pressed ? 0.7 : 1 },
                gutters.padding_12,
                gutters.gap_16,
              ]}
            >
              <Cover uri={work.coverUri} width={60} />
              <View style={[layout.flex_1, gutters.gap_8]}>
                <AppText color="onSurface" variant="labelMd">
                  {work.title}
                </AppText>
                <View style={[layout.row, layout.itemsCenter, gutters.gap_8]}>
                  <Tag
                    label={work.status === 'completed' ? 'Completed' : 'Ongoing'}
                    tone={work.status === 'completed' ? 'primary' : 'secondary'}
                  />
                  {work.moderation ? (
                    <Tag
                      label={work.moderation === 'APPROVED' ? 'Đã duyệt' : work.moderation === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                      tone={work.moderation === 'APPROVED' ? 'primary' : 'neutral'}
                    />
                  ) : null}
                </View>
              </View>
              <AppIcon color="onSurfaceVariant" name="chevron_right" />
            </Pressable>
          ))
        ) : (
          <View style={{ backgroundColor: colors.surfaceVariant, padding: 20, borderRadius: 12, alignItems: 'center' }}>
            <AppText color="onSurfaceVariant" variant="bodyMd">
              {isFetchingMyStories ? 'Đang tải tác phẩm...' : 'Bạn chưa có tác phẩm nào. Hãy tạo truyện mới ở bên dưới!'}
            </AppText>
          </View>
        )}
      </View>

      <View style={[gutters.marginVertical_24, gutters.gap_12]}>
        <Button
          fullWidth
          label={t('writer_studio.write_new')}
          onPress={openCreateModal}
          variant="filled"
        />
        <Button
          fullWidth
          label={isImporting ? 'Đang nhập sách...' : 'Nhập sách EPUB / PDF'}
          onPress={handleImportFile}
          variant="outlined"
          disabled={isImporting}
        />
      </View>

      {/* Modal Tạo / Chỉnh sửa Truyện */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxWidth: 420, maxHeight: '85%', backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText color="onSurface" variant="headlineMd" style={{ marginBottom: 20 }}>
                {editingStoryId ? 'Chỉnh sửa truyện' : 'Tạo truyện mới'}
              </AppText>

              <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginBottom: 6 }}>
                Tiêu đề truyện *
              </AppText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề truyện"
                placeholderTextColor="#999"
                style={{
                  backgroundColor: '#F4F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  fontFamily: FontFamily.jakarta,
                }}
              />

              <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginBottom: 6 }}>
                Mô tả / Tóm tắt
              </AppText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập tóm tắt nội dung..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: '#F4F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  fontFamily: FontFamily.jakarta,
                  height: 70,
                  textAlignVertical: 'top',
                }}
              />

              <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginBottom: 6 }}>
                Thể loại (phân cách bằng dấu phẩy)
              </AppText>
              <TextInput
                value={genres}
                onChangeText={setGenres}
                placeholder="Fantasy, Adventure"
                placeholderTextColor="#999"
                style={{
                  backgroundColor: '#F4F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  fontFamily: FontFamily.jakarta,
                }}
              />

              <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginBottom: 6 }}>
                Ảnh bìa (Đường dẫn URL - Để trống sẽ tự tạo ảnh bìa ngẫu nhiên)
              </AppText>
              <TextInput
                value={coverUri}
                onChangeText={setCoverUri}
                placeholder="https://example.com/cover.jpg"
                placeholderTextColor="#999"
                style={{
                  backgroundColor: '#F4F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 20,
                  fontFamily: FontFamily.jakarta,
                }}
              />

              {editingStoryId ? (
                <View style={{ marginBottom: 20, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 16 }}>
                  <View style={{ marginBottom: 16 }}>
                    <AppText color="onSurface" variant="headlineMd" style={{ marginBottom: 12 }}>
                      Danh sách chương
                    </AppText>
                    <Button
                      label="+ Thêm chương mới"
                      onPress={openAddChapterModal}
                      variant="outlined"
                      fullWidth
                    />
                  </View>

                  {Array.isArray(currentStoryDetail?.chapters) && currentStoryDetail.chapters.length > 0 ? (
                    currentStoryDetail.chapters.map((chap: any) => (
                      <Pressable
                        key={chap.id}
                        onPress={() => openEditChapterModal(chap)}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#F9F9FB',
                          padding: 12,
                          borderRadius: 12,
                          marginBottom: 8,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <AppText color="onSurface" variant="labelMd">
                            Chương {chap.index}: {chap.title}
                          </AppText>
                          <AppText color="onSurfaceVariant" variant="labelSm">
                            {chap.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'} {chap.isVip ? '• VIP' : ''}
                          </AppText>
                        </View>
                        <AppIcon color="onSurfaceVariant" name="chevron_right" />
                      </Pressable>
                    ))
                  ) : (
                    <AppText color="onSurfaceVariant" variant="bodyMd" style={{ fontStyle: 'italic', marginVertical: 8 }}>
                      Chưa có chương nào. Bấm "+ Thêm chương" ở trên để viết chương đầu tiên!
                    </AppText>
                  )}
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: editingStoryId ? 12 : 0 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Hủy" onPress={() => setModalVisible(false)} variant="outlined" fullWidth />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={loading ? 'Đang lưu...' : editingStoryId ? 'Lưu truyện' : 'Tạo mới'}
                    onPress={handleSaveStory}
                    disabled={loading || !title.trim()}
                    fullWidth
                  />
                </View>
              </View>

              {editingStoryId ? (
                <Button label="Xóa bộ truyện này" onPress={handleDeleteStory} variant="tonal" disabled={loading} fullWidth />
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Viết / Sửa / Xóa Chương */}
      <Modal animationType="slide" transparent visible={chapterModalVisible} onRequestClose={() => setChapterModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxWidth: 420, maxHeight: '85%', backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText color="onSurface" variant="headlineMd" style={{ marginBottom: 20 }}>
                {editingChapterId ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
              </AppText>

              <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginBottom: 6 }}>
                Tiêu đề chương *
              </AppText>
              <TextInput
                value={chapterTitle}
                onChangeText={setChapterTitle}
                placeholder="Ví dụ: Chương 1: Mở đầu cuộc hành trình"
                placeholderTextColor="#999"
                style={{
                  backgroundColor: '#F4F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  fontFamily: FontFamily.jakarta,
                }}
              />

              <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginBottom: 6 }}>
                Nội dung chương
              </AppText>
              <TextInput
                value={chapterContent}
                onChangeText={setChapterContent}
                placeholder="Nhập nội dung văn bản..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                style={{
                  backgroundColor: '#F4F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                  fontFamily: FontFamily.jakarta,
                  height: 120,
                  textAlignVertical: 'top',
                }}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label={isVip ? 'Chương VIP (Có phí)' : 'Miễn phí'}
                    onPress={() => setIsVip(!isVip)}
                    variant={isVip ? 'filled' : 'outlined'}
                    fullWidth
                  />
                </View>
                {isVip ? (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      value={coinPrice}
                      onChangeText={setCoinPrice}
                      placeholder="Giá xu (vd: 5)"
                      keyboardType="numeric"
                      style={{
                        backgroundColor: '#F4F4F6',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontFamily: FontFamily.jakarta,
                      }}
                    />
                  </View>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: editingChapterId ? 12 : 0 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Hủy" onPress={() => setChapterModalVisible(false)} variant="outlined" fullWidth />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={loading ? 'Đang lưu...' : 'Lưu / Auto-save'}
                    onPress={handleSaveChapter}
                    disabled={loading || !chapterTitle.trim()}
                    fullWidth
                  />
                </View>
              </View>

              {editingChapterId ? (
                <View style={{ gap: 8, marginTop: 8 }}>
                  <Button label="Xuất bản chương này" onPress={handlePublishChapter} disabled={loading} fullWidth />
                  <Button label="Xóa chương này (DELETE)" onPress={handleDeleteChapter} variant="tonal" disabled={loading} fullWidth />
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

export default Write;
