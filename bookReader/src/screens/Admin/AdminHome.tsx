import type { RootScreenProps } from '@/navigation/types';

import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks';
import { AdminServices } from '@/services/admin';
import { parseApiError } from '@/services/auth';
import { storage } from '@/services/storage';

import { SafeScreen } from '@/components/templates';
import { AppText, Button, Cover, Tag } from '@/components/atoms';
import { StatCard, Tabs } from '@/components/molecules';

function AdminHome({ navigation }: RootScreenProps<Paths.Admin>) {
  const { layout, gutters, colors, borders } = useTheme();
  const queryClient = useQueryClient();
  const { clearUser } = useUser();
  
  const [activeTab, setActiveTab] = useState(0); // 0: Overview & Story, 1: Reports, 2: Users
  const [loadingStoryId, setLoadingStoryId] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => AdminServices.getStats(),
  });

  const { data: stories } = useQuery({
    queryKey: ['admin-stories'],
    queryFn: () => AdminServices.getStories(),
  });

  const { data: reportsList } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => AdminServices.getReports(),
  });

  const { data: usersList } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => AdminServices.getUsers(),
  });

  async function handleModerate(storyId: string, moderation: 'APPROVED' | 'REJECTED') {
    setLoadingStoryId(storyId);
    try {
      await AdminServices.moderateStory(storyId, moderation);
      Alert.alert('Thành công', moderation === 'APPROVED' ? 'Đã duyệt bộ truyện!' : 'Đã từ chối bộ truyện!');
      await queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Thao tác kiểm duyệt thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoadingStoryId(null);
    }
  }

  async function handleResolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', action?: 'HIDE_COMMENT' | 'KEEP_COMMENT') {
    setLoadingReportId(reportId);
    try {
      await AdminServices.resolveReport(reportId, { status, action });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái báo cáo vi phạm!');
      await queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Xử lý báo cáo vi phạm thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoadingReportId(null);
    }
  }

  async function handleToggleBan(userId: string, currentStatus: string) {
    setLoadingUserId(userId);
    const targetStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await AdminServices.updateUser(userId, { status: targetStatus });
      Alert.alert('Thành công', targetStatus === 'BANNED' ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Thao tác thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoadingUserId(null);
    }
  }

  function promptChangeRole(userId: string) {
    Alert.alert(
      'Thay đổi vai trò',
      'Chọn vai trò mới cho người dùng này:',
      [
        { text: 'Độc giả (READER)', onPress: () => handleChangeRole(userId, 'READER') },
        { text: 'Tác giả (WRITER)', onPress: () => handleChangeRole(userId, 'WRITER') },
        { text: 'Quản trị (ADMIN)', onPress: () => handleChangeRole(userId, 'ADMIN') },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  }

  async function handleChangeRole(userId: string, role: 'READER' | 'WRITER' | 'ADMIN') {
    setLoadingUserId(userId);
    try {
      await AdminServices.updateUser(userId, { role });
      Alert.alert('Thành công', 'Đã thay đổi vai trò người dùng!');
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Đổi vai trò thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoadingUserId(null);
    }
  }

  function handleLogout() {
    clearUser();
    navigation.reset({ index: 0, routes: [{ name: Paths.Login }] });
  }

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.padding_24, gutters.gap_24]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[layout.row, layout.itemsCenter, layout.justifyBetween] as any}>
          <AppText variant="headlineLg">Trang Quản Trị (Admin)</AppText>
          <Button
            label="Đăng xuất"
            variant="outlined"
            onPress={handleLogout}
          />
        </View>

        {/* Tab Selector */}
        <Tabs
          activeIndex={activeTab}
          onChange={setActiveTab}
          tabs={['Tổng quan & Truyện', 'Báo cáo vi phạm', 'Quản lý Người dùng']}
        />

        {activeTab === 0 ? (
          <View style={{ gap: 24 }}>
            {/* System Stats */}
            <View style={[layout.row, gutters.gap_12] as any}>
              <View style={{ flex: 1 }}>
                <StatCard icon="people" label="Tổng người dùng" value={String(stats?.usersCount ?? 0)} />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard icon="book" label="Tổng truyện" value={String(stats?.storiesCount ?? 0)} />
              </View>
            </View>

            <View style={[layout.row, gutters.gap_12] as any}>
              <View style={{ flex: 1 }}>
                <StatCard icon="auto_stories" label="Tổng chương" value={String(stats?.chaptersCount ?? 0)} />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard icon="lock_open" label="Xu mở khóa VIP" value={String(stats?.coinsSpentOnUnlocks ?? 0)} />
              </View>
            </View>

            {/* Stories Moderation List */}
            <View style={{ marginTop: 12 }}>
              <AppText variant="headlineMd" style={{ marginBottom: 16 }}>
                Kiểm duyệt truyện ({Array.isArray(stories) ? stories.length : 0})
              </AppText>

              {Array.isArray(stories) && stories.length > 0 ? (
                stories.map((story: any) => (
                  <View
                    key={story.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <Cover uri={story.coverUri} width={60} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <AppText color="onSurface" variant="headlineMd">
                          {story.title}
                        </AppText>
                        <AppText color="onSurfaceVariant" variant="labelSm">
                          Tác giả: {story.author?.name ?? 'Chưa rõ'} • Thể loại: {Array.isArray(story.genres) ? story.genres.join(', ') : 'Chưa xếp'}
                        </AppText>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                          <Tag
                            label={story.moderation === 'APPROVED' ? 'Đã duyệt' : story.moderation === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                            tone={story.moderation === 'APPROVED' ? 'primary' : story.moderation === 'REJECTED' ? 'error' : 'secondary'}
                          />
                        </View>
                      </View>
                    </View>

                    {story.moderation === 'PENDING' ? (
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Duyệt truyện"
                            onPress={() => handleModerate(story.id, 'APPROVED')}
                            disabled={loadingStoryId === story.id}
                            fullWidth
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Từ chối"
                            variant="outlined"
                            onPress={() => handleModerate(story.id, 'REJECTED')}
                            disabled={loadingStoryId === story.id}
                            fullWidth
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))
              ) : (
                <View style={{ backgroundColor: '#F4F4F6', borderRadius: 12, padding: 24, alignItems: 'center' }}>
                  <AppText color="onSurfaceVariant" variant="bodyMd">
                    Hiện tại không có truyện nào cần kiểm duyệt.
                  </AppText>
                </View>
              )}
            </View>
          </View>
        ) : activeTab === 1 ? (
          /* Reports Management Section */
          <View style={{ gap: 16 }}>
            <AppText variant="headlineMd">Báo cáo vi phạm ({Array.isArray(reportsList) ? reportsList.length : 0})</AppText>

            {Array.isArray(reportsList) && reportsList.length > 0 ? (
              reportsList.map((rep: any) => (
                <View
                  key={rep.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View style={{ gap: 6, marginBottom: 12 }}>
                    <AppText color="onSurface" variant="headlineMd">
                      Lý do: {rep.reason}
                    </AppText>
                    <AppText color="onSurfaceVariant" variant="bodyMd">
                      Người báo cáo: {rep.reporter?.name ?? 'Độc giả'} (@{rep.reporter?.handle ?? 'unknown'})
                    </AppText>
                    {rep.story ? (
                      <AppText color="primary" variant="labelSm">
                        Truyện bị báo cáo: {rep.story.title}
                      </AppText>
                    ) : null}
                    {rep.comment ? (
                      <AppText color="error" variant="labelSm">
                        Bình luận bị báo cáo: "{rep.comment.content}"
                      </AppText>
                    ) : null}
                    <View style={{ flexDirection: 'row', marginTop: 4 }}>
                      <Tag label={rep.status} tone={rep.status === 'OPEN' ? 'secondary' : 'neutral'} />
                    </View>
                  </View>

                  {rep.status === 'OPEN' ? (
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {rep.commentId ? (
                          <View style={{ flex: 1 }}>
                            <Button
                              label="Ẩn bình luận"
                              onPress={() => handleResolveReport(rep.id, 'RESOLVED', 'HIDE_COMMENT')}
                              disabled={loadingReportId === rep.id}
                              fullWidth
                            />
                          </View>
                        ) : null}
                        {rep.storyId ? (
                          <View style={{ flex: 1 }}>
                            <Button
                              label="Từ chối truyện"
                              onPress={() => handleResolveReport(rep.id, 'RESOLVED', 'REJECT_STORY')}
                              disabled={loadingReportId === rep.id}
                              fullWidth
                            />
                          </View>
                        ) : null}
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Khóa tài khoản vi phạm"
                            variant="tonal"
                            onPress={() => handleResolveReport(rep.id, 'RESOLVED', 'BAN_USER')}
                            disabled={loadingReportId === rep.id}
                            fullWidth
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Bỏ qua"
                            variant="outlined"
                            onPress={() => handleResolveReport(rep.id, 'DISMISSED')}
                            disabled={loadingReportId === rep.id}
                            fullWidth
                          />
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <View style={{ backgroundColor: '#F4F4F6', borderRadius: 12, padding: 24, alignItems: 'center' }}>
                <AppText color="onSurfaceVariant" variant="bodyMd">Không có báo cáo vi phạm nào.</AppText>
              </View>
            )}
          </View>
        ) : (
          /* User Management Section */
          <View style={{ gap: 16 }}>
            <AppText variant="headlineMd">Danh sách người dùng ({Array.isArray(usersList) ? usersList.length : 0})</AppText>

            {Array.isArray(usersList) && usersList.length > 0 ? (
              usersList.map((usr: any) => (
                <View
                  key={usr.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <AppText color="onSurface" variant="headlineMd">
                        {usr.name} {usr.handle ? `@${usr.handle}` : ''}
                      </AppText>
                      <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginTop: 2 }}>
                        {usr.email} • Số dư xu: {usr.coinBalance ?? 0} xu
                      </AppText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Tag label={usr.role} tone="primary" />
                      <Tag label={usr.status} tone={usr.status === 'ACTIVE' ? 'primary' : 'error'} />
                    </View>
                  </View>

                  {/* Actions for User */}
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Đổi vai trò"
                        variant="outlined"
                        onPress={() => promptChangeRole(usr.id)}
                        disabled={loadingUserId === usr.id}
                        fullWidth
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label={usr.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                        variant={usr.status === 'ACTIVE' ? 'tonal' : 'filled'}
                        onPress={() => handleToggleBan(usr.id, usr.status)}
                        disabled={loadingUserId === usr.id}
                        fullWidth
                      />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ backgroundColor: '#F4F4F6', borderRadius: 12, padding: 24, alignItems: 'center' }}>
                <AppText color="onSurfaceVariant" variant="bodyMd">Chưa có người dùng nào đăng ký.</AppText>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

export default AdminHome;
