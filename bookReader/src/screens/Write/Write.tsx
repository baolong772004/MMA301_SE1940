/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-magic-numbers */
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppIcon, AppText, Button, Cover, Tag } from '@/components/atoms';
import { SectionHeader, StatCard } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { authorStats, authorWorks } from '@/mocks/authorWorks';

function Write() {
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const statsContainerStyle: any = [
    layout.row,
    gutters.gap_12,
    gutters.marginVertical_16,
  ];

  const worksListStyle: any = [
    layout.col,
    gutters.gap_16,
    gutters.marginTop_16,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer scroll title={t('writer_studio.title')}>
      <View style={statsContainerStyle}>
        {authorStats.map((stat) => (
          <StatCard
            icon={stat.icon}
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
          />
        ))}
      </View>

      <SectionHeader title={t('writer_studio.my_works')} />

      <View style={worksListStyle}>
        {authorWorks.map((work) => (
          <Pressable
            key={work.id}
            onPress={() => {
              Alert.alert(
                t('writer_studio.title'),
                t('writer_studio.edit_placeholder', { title: work.title }),
              );
            }}
            style={({ pressed }) => [
              layout.row,
              layout.itemsCenter,
              backgrounds.surface,
              borders.rounded_12,
              borders.w_1,
              { borderColor: colors.outlineVariant, opacity: pressed ? 0.7 : 1 },
              gutters.padding_12,
              gutters.gap_16,
            ]}
          >
            <Cover uri={work.coverUri} width={60} />
            <View style={[layout.flex_1, gutters.gap_8]}>
              <AppText color="onSurface" variant="headlineMd">
                {work.title}
              </AppText>
              <View style={[layout.row, layout.itemsCenter]}>
                <Tag
                  label={work.status === 'completed' ? 'Completed' : 'Ongoing'}
                  tone={work.status === 'completed' ? 'primary' : 'secondary'}
                />
              </View>
            </View>
            <AppIcon color="onSurfaceVariant" name="chevron_right" />
          </Pressable>
        ))}
      </View>

      <View style={gutters.marginVertical_24}>
        <Button
          fullWidth
          label={t('writer_studio.write_new')}
          onPress={() => {
            Alert.alert(t('writer_studio.title'), t('writer_studio.write_new'));
          }}
          variant="filled"
        />
      </View>
    </ScreenContainer>
  );
}

export default Write;
