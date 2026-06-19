/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppText, Avatar, Button } from '@/components/atoms';
import { SettingRow, StatItem } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { profileData } from '@/mocks/profile';

function Profile({ navigation }: MainTabScreenProps<Paths.Profile>) {
  const { colors, gutters, layout } = useTheme();
  const { t } = useTranslation();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const headerStyle: any = [
    layout.itemsCenter,
    gutters.gap_12,
    gutters.marginVertical_24,
  ];

  const statsRowStyle: any = [
    layout.row,
    layout.itemsCenter,
    layout.justifyAround,
    gutters.paddingVertical_16,
    { borderBottomWidth: 1, borderColor: colors.outlineVariant, borderTopWidth: 1 },
    gutters.marginVertical_16,
  ];

  const menuStyle: any = [
    layout.col,
    gutters.marginTop_24,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer padded title={t('profile.title')}>
      {/* Avatar & User Details */}
      <View style={headerStyle}>
        <Avatar size={96} uri={profileData.avatarUri} />
        <AppText color="onSurface" variant="headlineLg">
          {profileData.name}
        </AppText>
        <AppText color="onSurfaceVariant" variant="bodyMd">
          {profileData.handle}
        </AppText>
        <View style={gutters.marginTop_8}>
          <Button
            label={t('profile.edit_profile')}
            onPress={() => {
              Alert.alert(t('profile.title'), t('profile.alert_edit'));
            }}
            variant="tonal"
          />
        </View>
      </View>

      {/* Stats Row */}
      <View style={statsRowStyle}>
        <StatItem
          label={t('profile.stories')}
          value={String(profileData.storiesCount)}
        />
        <StatItem
          label={t('profile.followers')}
          value={String(profileData.followersCount)}
        />
        <StatItem
          label={t('profile.following')}
          value={String(profileData.followingCount)}
        />
      </View>

      {/* Menu Options */}
      <View style={menuStyle}>
        <SettingRow
          iconName="theme"
          label={t('profile.settings')}
          onPress={() => {
            navigation.navigate(Paths.Settings);
          }}
        />
        <SettingRow
          iconName="fire"
          label={t('profile.streak')}
          onPress={() => {
            navigation.navigate(Paths.Streak);
          }}
        />
        <SettingRow
          iconName="person"
          label={t('profile.logout')}
          onPress={() => {
            Alert.alert(t('profile.title'), t('profile.alert_logout'));
          }}
        />
      </View>
    </ScreenContainer>
  );
}

export default Profile;
