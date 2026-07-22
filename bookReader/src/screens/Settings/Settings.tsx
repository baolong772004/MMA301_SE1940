import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, View, Pressable } from 'react-native';

import { useI18n } from '@/hooks/language/useI18n';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppText, AppIcon, Avatar } from '@/components/atoms';
import { SettingRow } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';
import { useUser } from '@/hooks';
import { AuthServices } from '@/services/auth';
import { storage } from '@/services/storage';

function Settings({ navigation }: RootScreenProps<Paths.Settings>) {
  const { changeTheme, colors, variant, layout, gutters } = useTheme();
  const { t } = useTranslation();
  const { toggleLanguage } = useI18n();
  const { user } = useUser();

  const cardStyle = [
    gutters.marginBottom_24,
    gutters.padding_16,
    {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 12,
      borderColor: colors.surfaceVariant,
      borderWidth: 1,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
    }
  ];

  const groupCardStyle = [
    gutters.marginBottom_16,
    {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 12,
      borderColor: colors.surfaceVariant,
      borderWidth: 1,
      overflow: 'hidden' as const,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
    }
  ];

  const headerStyle = [
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_12,
    {
      backgroundColor: colors.surfaceContainerLow,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    }
  ];

  const logoutButtonStyle = [
    layout.row,
    layout.itemsCenter,
    layout.justifyCenter,
    gutters.paddingVertical_12,
    gutters.marginTop_24,
    gutters.gap_12,
    {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
    }
  ];

  const settingRowContainerStyle = [
    gutters.paddingHorizontal_24,
  ];

  function handleReadingPreferences() {
    Alert.alert(
      'Cấu hình đọc sách mặc định',
      'Chọn kích thước chữ mặc định khi mở trình đọc:',
      [
        { text: 'Cỡ vừa (18px)', onPress: () => { storage.set('reader_font_size', '18'); Alert.alert('Đã lưu', 'Cỡ chữ mặc định: 18px'); } },
        { text: 'Cỡ lớn (22px)', onPress: () => { storage.set('reader_font_size', '22'); Alert.alert('Đã lưu', 'Cỡ chữ mặc định: 22px'); } },
        { text: 'Cỡ rất lớn (26px)', onPress: () => { storage.set('reader_font_size', '26'); Alert.alert('Đã lưu', 'Cỡ chữ mặc định: 26px'); } },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  }

  function handleNotifications() {
    (navigation as any).navigate(Paths.Main, { screen: Paths.Alerts });
  }

  const { data: meData } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => AuthServices.getMe(),
  });

  const displayRole = meData?.role === 'ADMIN' ? 'Quản trị viên (ADMIN)' : meData?.role === 'WRITER' ? 'Tác giả (WRITER)' : 'Độc giả (READER)';

  function handleSecurity() {
    Alert.alert(
      'Bảo mật tài khoản',
      `Tài khoản: ${meData?.name ?? user?.name ?? 'Chưa rõ'}\nVai trò: ${displayRole}\nTrạng thái: Hoạt động ✅`,
      [{ text: 'Đóng' }],
    );
  }

  function handlePrivacy() {
    Alert.alert(
      'Chính sách quyền riêng tư',
      'NovaTales bảo mật tuyệt đối dữ liệu lịch sử đọc sách và thông tin tài khoản của bạn theo tiêu chuẩn mã hóa dữ liệu.',
      [{ text: 'Đã hiểu' }],
    );
  }

  return (
    <ScreenContainer
      onLeftPress={() => {
        navigation.goBack();
      }}
      padded
      showBack
      title={t('settings.title')}
    >
      <View style={gutters.marginTop_16}>
        {/* Account Info Card */}
        <View style={[layout.row, layout.itemsCenter, gutters.gap_24, cardStyle]}>
          <Avatar size={64} uri={meData?.avatarUri ?? user?.photoURL ?? ''} />
          <View>
            <AppText color="onSurface" variant="headlineMd">
              {meData?.name ?? user?.name ?? 'Người dùng'}
            </AppText>
            <AppText color="onSurfaceVariant" variant="labelSm">
              {displayRole} • NovaTales
            </AppText>
          </View>
        </View>

        {/* Preferences Group */}
        <View style={groupCardStyle}>
          <View style={headerStyle}>
            <AppText color="primary" variant="labelSm" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Preferences
            </AppText>
          </View>
          <View style={settingRowContainerStyle}>
            <SettingRow
              iconName="theme"
              label={t('settings.dark_mode')}
              rightElement={
                <Switch
                  onValueChange={(value) => {
                    changeTheme(value ? 'dark' : 'default');
                  }}
                  thumbColor={variant === 'dark' ? colors.primary : colors.outline}
                  trackColor={{
                    false: colors.outlineVariant,
                    true: colors.primaryContainer,
                  }}
                  value={variant === 'dark'}
                />
              }
            />
            <SettingRow
              iconName="language"
              label={t('settings.language')}
              onPress={toggleLanguage}
              rightElement={
                <View style={[layout.row, layout.itemsCenter, gutters.gap_4]}>
                  <AppText color="onSurfaceVariant" variant="labelSm">
                    {t('settings.language_current')}
                  </AppText>
                  <AppIcon color="onSurfaceVariant" name="chevron_right" size={20} />
                </View>
              }
            />
            <SettingRow
              iconName="font_download"
              label="Reading Preferences"
              onPress={handleReadingPreferences}
              noBorder
            />
          </View>
        </View>

        {/* Communications Group */}
        <View style={groupCardStyle}>
          <View style={headerStyle}>
            <AppText color="primary" variant="labelSm" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Communications
            </AppText>
          </View>
          <View style={settingRowContainerStyle}>
            <SettingRow
              iconName="notifications"
              label="Notifications"
              onPress={handleNotifications}
              noBorder
            />
          </View>
        </View>

        {/* Account Group */}
        <View style={groupCardStyle}>
          <View style={headerStyle}>
            <AppText color="primary" variant="labelSm" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Account
            </AppText>
          </View>
          <View style={settingRowContainerStyle}>
            <SettingRow
              iconName="security"
              label="Security"
              onPress={handleSecurity}
            />
            <SettingRow
              iconName="policy"
              label="Quyền riêng tư"
              onPress={handlePrivacy}
              noBorder
            />
          </View>
        </View>

        {/* Logout Button */}
        <Pressable 
          onPress={() => {
            navigation.reset({ index: 0, routes: [{ name: Paths.Login }] });
          }}
          style={({ pressed }) => [
            logoutButtonStyle,
            pressed && { backgroundColor: colors.errorContainer }
          ]}
        >
          <AppIcon color="error" name="logout" size={24} />
          <AppText color="error" variant="labelMd">
            Đăng xuất
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

export default Settings;
