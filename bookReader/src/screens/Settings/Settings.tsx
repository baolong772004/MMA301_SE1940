 
 import { useTranslation } from 'react-i18next';
import { Alert, Switch, View, Pressable } from 'react-native';

import { useI18n } from '@/hooks/language/useI18n';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppText, AppIcon, Avatar } from '@/components/atoms';
import { SettingRow } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { profileData } from '@/mocks/profile';

function Settings({ navigation }: RootScreenProps<Paths.Settings>) {
  const { changeTheme, colors, variant, layout, gutters } = useTheme();
  const { t } = useTranslation();
  const { toggleLanguage } = useI18n();

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
          <Avatar size={64} uri={profileData.avatarUri} />
          <View>
            <AppText color="onSurface" variant="headlineMd">
              {profileData.name}
            </AppText>
            <AppText color="onSurfaceVariant" variant="labelSm">
              Premium Member
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
              onPress={() => {}}
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
              onPress={() => {}}
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
              onPress={() => {}}
            />
            <SettingRow
              iconName="policy"
              label="Quyền riêng tư"
              onPress={() => {}}
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
