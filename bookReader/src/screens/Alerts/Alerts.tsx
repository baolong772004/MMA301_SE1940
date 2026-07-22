import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@/theme';
import { NotificationItem, SectionHeader } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';
import { AppText } from '@/components/atoms';
import { NotificationServices, ApiNotification } from '@/services/notifications/notificationService';
import { parseApiError } from '@/services/auth';

function Alerts() {
  const { gutters, layout, colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<ApiNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => NotificationServices.getNotifications(),
    // Làm mới mỗi khi màn hình focus
    refetchOnWindowFocus: true,
  });

  // Làm mới khi focus vào tab
  useCallback(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return unsubscribe;
  }, [navigation, queryClient]);

  async function handleMarkAllRead() {
    try {
      await NotificationServices.markAllAsRead();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      Alert.alert('Thông báo', 'Đã đánh dấu đọc tất cả thông báo!');
    } catch (err: unknown) {
      const msg = await parseApiError(err, 'Thao tác thất bại.');
      Alert.alert('Lỗi', msg);
    }
  }

  // Tách nhóm: chưa đọc / đã đọc
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  // Định dạng thời gian tương đối
  function formatTime(createdAt: string): string {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    if (diffMins > 0) return `${diffMins} phút trước`;
    return 'Vừa xong';
  }

  return (
    <ScreenContainer
      scroll
      title={t('alerts.title')}
      rightIcon="theme"
      onRightPress={handleMarkAllRead}
    >
      {isLoading ? (
        <View style={[layout.itemsCenter, gutters.padding_24]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Chưa đọc */}
          <View style={[layout.col, gutters.gap_16]}>
            <SectionHeader title={`${t('alerts.today')} (${unreadNotifications.length})`} />
            <View style={layout.col}>
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((item) => (
                  <NotificationItem
                    key={item.id}
                    message={`${item.title}: ${item.body}`}
                    time={formatTime(item.createdAt)}
                    unread={!item.read}
                  />
                ))
              ) : (
                <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                  <AppText color="onSurfaceVariant" variant="labelSm" style={{ fontStyle: 'italic' }}>
                    Không có thông báo mới.
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Đã đọc */}
          <View style={[layout.col, gutters.gap_16, gutters.marginTop_24]}>
            <SectionHeader title={t('alerts.earlier')} />
            <View style={layout.col}>
              {readNotifications.length > 0 ? (
                readNotifications.map((item) => (
                  <NotificationItem
                    key={item.id}
                    message={`${item.title}: ${item.body}`}
                    time={formatTime(item.createdAt)}
                    unread={false}
                  />
                ))
              ) : (
                <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                  <AppText color="onSurfaceVariant" variant="labelSm" style={{ fontStyle: 'italic' }}>
                    Không có thông báo cũ.
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

export default Alerts;
