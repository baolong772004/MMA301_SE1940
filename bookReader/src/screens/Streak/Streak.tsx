/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { ViewStyle } from 'react-native';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { UserServices } from '@/services/users';

import { AppIcon, AppText } from '@/components/atoms';
import { ScreenContainer } from '@/components/templates';

const DAY_LABELS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'] as const;

function Streak({ navigation }: RootScreenProps<Paths.Streak>) {
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const { data: streakData, isLoading } = useQuery({
    queryKey: ['user-streak'],
    queryFn: () => UserServices.getStreak(),
  });

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const totalReadingDays = streakData?.totalReadingDays ?? 0;

  // Tô màu currentStreak ngày gần nhất trong lưới 7 ngày (từ phải sang trái)
  const streakHistory = DAY_LABELS.map((_, i) => i >= 7 - currentStreak);

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
      onLeftPress={() => { navigation.goBack(); }}
      padded
      showBack
      title={t('streak.title')}
    >
      {isLoading ? (
        <View style={[layout.itemsCenter, gutters.padding_24]}>
          <ActivityIndicator size="large" color={colors.tertiary} />
        </View>
      ) : (
        <>
          {/* Card streak chính */}
          <View style={cardStyle}>
            <AppIcon color="tertiary" name="fire" size={80} />

            <View style={[layout.itemsCenter, gutters.gap_4]}>
              <AppText color="tertiary" variant="display">
                {currentStreak}
              </AppText>
              <AppText color="onSurface" style={{ textAlign: 'center' }} variant="headlineMd">
                {t('streak.days_consecutive', { count: currentStreak })}
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
