 
 
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { NotificationItem, SectionHeader } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { earlierNotifications, todayNotifications } from '@/mocks/notifications';

function Alerts() {
  const { gutters, layout } = useTheme();
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll title={t('alerts.title')}>
      {/* Today Section */}
      <View style={[layout.col, gutters.gap_16]}>
        <SectionHeader title={t('alerts.today')} />
        <View style={layout.col}>
          {todayNotifications.map((item) => (
            <NotificationItem
              avatarUri={item.avatarUri}
              iconName={item.iconName}
              key={item.id}
              message={item.message}
              time={item.time}
              unread={item.unread}
            />
          ))}
        </View>
      </View>

      {/* Earlier Section */}
      <View style={[layout.col, gutters.gap_16, gutters.marginTop_24]}>
        <SectionHeader title={t('alerts.earlier')} />
        <View style={layout.col}>
          {earlierNotifications.map((item) => (
            <NotificationItem
              avatarUri={item.avatarUri}
              iconName={item.iconName}
              key={item.id}
              message={item.message}
              time={item.time}
              unread={item.unread}
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

export default Alerts;
