/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
import type { ViewStyle } from 'react-native';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppIcon, AppText } from '@/components/atoms';
import { ScreenContainer } from '@/components/templates';

function Streak({ navigation }: RootScreenProps<Paths.Streak>) {
  const { backgrounds, borders, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const streakDaysCount = 5;
  const streakHistory = [true, true, true, true, true, false, false];

  const days = [
    { achieved: streakHistory[0], label: t('streak.day_1') },
    { achieved: streakHistory[1], label: t('streak.day_2') },
    { achieved: streakHistory[2], label: t('streak.day_3') },
    { achieved: streakHistory[3], label: t('streak.day_4') },
    { achieved: streakHistory[4], label: t('streak.day_5') },
    { achieved: streakHistory[5], label: t('streak.day_6') },
    { achieved: streakHistory[6], label: t('streak.day_7') },
  ];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const cardStyle: any = [
    backgrounds.surfaceContainerLow,
    borders.rounded_16 as any,
    gutters.padding_24,
    layout.itemsCenter,
    gutters.gap_16,
  ];

  const gridContainerStyle: any = [
    layout.row,
    layout.justifyBetween,
    layout.fullWidth,
    gutters.marginTop_16,
  ];

  const dayItemStyle: any = [
    layout.itemsCenter,
    gutters.gap_8,
  ];

  const circleBaseStyle: ViewStyle = {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer
      onLeftPress={() => {
        navigation.goBack();
      }}
      padded
      showBack
      title={t('streak.title')}
    >
      <View style={cardStyle}>
        <AppIcon color="tertiary" name="fire" size={80} />
        
        <View style={[layout.itemsCenter, gutters.gap_4]}>
          <AppText color="tertiary" variant="display">
            {streakDaysCount}
          </AppText>
          <AppText color="onSurface" style={{ textAlign: 'center' }} variant="headlineMd">
            {t('streak.days_consecutive', { count: streakDaysCount })}
          </AppText>
        </View>

        <AppText color="onSurfaceVariant" style={{ textAlign: 'center' }} variant="bodyMd">
          {t('streak.subtitle')}
        </AppText>

        <View style={gridContainerStyle}>
          {days.map((day) => {
            const circleStyle = [
              circleBaseStyle,
              day.achieved
                ? backgrounds.tertiaryContainer
                : backgrounds.surfaceContainerHighest,
            ];

            return (
              <View key={day.label} style={dayItemStyle}>
                <View style={circleStyle}>
                  <AppIcon
                    color={day.achieved ? 'tertiary' : 'outlineVariant'}
                    name="fire"
                    size={20}
                  />
                </View>
                <AppText
                  color={day.achieved ? 'tertiary' : 'onSurfaceVariant'}
                  variant="labelSm"
                >
                  {day.label}
                </AppText>
              </View>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

export default Streak;
