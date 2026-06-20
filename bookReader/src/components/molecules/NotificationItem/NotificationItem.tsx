/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppIcon, AppText, Avatar } from '@/components/atoms';

type Properties = {
  readonly avatarUri?: string;
  readonly iconName?: string;
  readonly message: string;
  readonly time: string;
  readonly unread: boolean;
};

function NotificationItem({
  avatarUri = undefined,
  iconName = 'notifications',
  message,
  time,
  unread,
}: Properties) {
  const { backgrounds, borders, colors, gutters, layout } = useTheme();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const containerStyle: any = [
    layout.row,
    layout.itemsCenter,
    gutters.gap_16,
    gutters.paddingVertical_16,
    borders.wBottom_1,
    { borderColor: colors.outlineVariant },
  ];

  const iconWrapperStyle: any = [
    layout.itemsCenter,
    layout.justifyCenter,
    borders.rounded_9999 as any,
    backgrounds.surfaceContainerHigh as any,
    { height: 48, width: 48 },
  ];

  const unreadDotStyle: any = [
    borders.rounded_9999 as any,
    { backgroundColor: colors.primary, height: 8, width: 8 },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <View style={containerStyle}>
      {avatarUri ? (
        <Avatar size={48} uri={avatarUri} />
      ) : (
        <View style={iconWrapperStyle}>
          <AppIcon color="primary" name={iconName} size={24} />
        </View>
      )}
      <View style={[layout.flex_1, gutters.gap_4]}>
        <AppText color="onSurface" variant="bodyMd">
          {message}
        </AppText>
        <AppText color="onSurfaceVariant" variant="labelSm">
          {time}
        </AppText>
      </View>
      {unread ? <View style={unreadDotStyle} /> : undefined}
    </View>
  );
}

export default NotificationItem;
