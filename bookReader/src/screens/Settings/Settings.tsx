 
 
import { useTranslation } from 'react-i18next';
import { Alert, Switch, View } from 'react-native';

import { useI18n } from '@/hooks/language/useI18n';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppText } from '@/components/atoms';
import { SettingRow } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

function Settings({ navigation }: RootScreenProps<Paths.Settings>) {
  const { changeTheme, colors, variant } = useTheme();
  const { t } = useTranslation();
  const { toggleLanguage } = useI18n();

  return (
    <ScreenContainer
      onLeftPress={() => {
        navigation.goBack();
      }}
      padded
      showBack
      title={t('settings.title')}
    >
      <View>
        {/* Dark Mode toggle row */}
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

        {/* Language switch row */}
        <SettingRow
          iconName="language"
          label={t('settings.language')}
          onPress={toggleLanguage}
          rightElement={
            <AppText color="primary" variant="labelMd">
              {t('settings.language_current')}
            </AppText>
          }
        />

        {/* About row */}
        <SettingRow
          iconName="auto_stories"
          label={t('settings.about')}
          onPress={() => {
            Alert.alert(t('settings.title'), 'NovaTales v1.0.0');
          }}
        />
      </View>
    </ScreenContainer>
  );
}

export default Settings;
