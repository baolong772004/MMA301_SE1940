import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/theme';
import { NotificationItem, SectionHeader } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';
import { LocalNotificationServices, LocalNotification } from '@/services/notifications/localNotificationService';

function Alerts() {
  const { gutters, layout } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<LocalNotification[]>([]);

  // Tải lại danh sách thông báo khi màn hình được active/focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setNotifications(LocalNotificationServices.getNotifications());
    });
    // Lần đầu render
    setNotifications(LocalNotificationServices.getNotifications());
    return unsubscribe;
  }, [navigation]);

  function handleMarkAllRead() {
    const updated = LocalNotificationServices.markAllAsRead();
    setNotifications(updated);
    Alert.alert('Thông báo', 'Đã đánh dấu đọc tất cả thông báo!');
  }

  // Tách nhóm thông báo mới chưa đọc và thông báo cũ đã đọc
  const todayNotifications = notifications.filter((n) => n.unread);
  const earlierNotifications = notifications.filter((n) => !n.unread);

  return (
    <ScreenContainer
      scroll
      title={t('alerts.title')}
      rightIcon="theme" // Dùng icon theme có sẵn để biểu thị nút cài đặt/hành động
      onRightPress={handleMarkAllRead}
    >
      {/* Today Section (Chưa đọc) */}
      <View style={[layout.col, gutters.gap_16]}>
        <SectionHeader title={t('alerts.today') + ` (${todayNotifications.length})`} />
        <View style={layout.col}>
          {todayNotifications.length > 0 ? (
            todayNotifications.map((item) => (
              <NotificationItem
                avatarUri={item.avatarUri}
                iconName={item.iconName}
                key={item.id}
                message={item.message}
                time={item.time}
                unread={item.unread}
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

      {/* Earlier Section (Đã đọc) */}
      <View style={[layout.col, gutters.gap_16, gutters.marginTop_24]}>
        <SectionHeader title={t('alerts.earlier')} />
        <View style={layout.col}>
          {earlierNotifications.length > 0 ? (
            earlierNotifications.map((item) => (
              <NotificationItem
                avatarUri={item.avatarUri}
                iconName={item.iconName}
                key={item.id}
                message={item.message}
                time={item.time}
                unread={item.unread}
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
    </ScreenContainer>
  );
}

// Bổ sung import AppText bị thiếu
import { AppText } from '@/components/atoms';

export default Alerts;
