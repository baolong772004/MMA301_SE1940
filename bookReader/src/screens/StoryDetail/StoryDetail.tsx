/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppText, Button, Cover, RatingStars, Tag } from '@/components/atoms';
import {
  AuthorBar,
  ChapterListItem,
  SectionHeader,
  StatItem,
  Tabs,
} from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { chapters, featuredStory, recommendedStories } from '@/mocks/stories';

function StoryDetail({ navigation, route }: RootScreenProps<Paths.StoryDetail>) {
  const { storyId } = route.params;
  const { backgrounds, borders, colors, gutters, layout } = useTheme();
  const { t } = useTranslation();

  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const story =
    storyId === featuredStory.id
      ? featuredStory
      : recommendedStories.find((item) => item.id === storyId) ?? featuredStory;

  const mockDescription = t('story_detail.mock_description');

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const heroContainerStyle: any = [
    layout.itemsCenter,
    gutters.gap_16,
    gutters.paddingHorizontal_24,
    gutters.paddingTop_24,
  ];

  const genresStyle: any = [
    layout.row,
    layout.wrap,
    gutters.gap_8,
    layout.justifyCenter,
  ];

  const statsContainerStyle: any = [
    layout.row,
    layout.itemsCenter,
    layout.justifyAround,
    gutters.paddingVertical_16,
    gutters.marginHorizontal_24,
    borders.rounded_12,
    borders.w_1,
    { borderColor: colors.outlineVariant },
  ];

  const sectionStyle: any = [
    gutters.paddingHorizontal_24,
    gutters.gap_12,
  ];

  const tabsContainerStyle: any = [
    gutters.paddingHorizontal_24,
  ];

  const tabContentStyle: any = [
    gutters.paddingHorizontal_24,
    gutters.gap_12,
  ];

  const ctaContainerStyle: any = [
    layout.row,
    layout.itemsCenter,
    backgrounds.surface,
    borders.wTop_1,
    borders.surfaceVariant,
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_16,
    gutters.gap_12,
  ];

  const footerContainerStyle: any = [
    layout.col,
    layout.itemsCenter,
    gutters.gap_16,
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_24,
    borders.wTop_1,
    { borderColor: colors.outlineVariant },
  ];

  const footerLinksStyle: any = [
    layout.row,
    layout.itemsCenter,
    layout.justifyCenter,
    gutters.gap_16,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer
      onLeftPress={() => {
        navigation.goBack();
      }}
      padded={false}
      scroll={false}
      showBack
      title={t('story_detail.title')}
    >
      <View style={[layout.flex_1, layout.col]}>
        <ScrollView
          contentContainerStyle={[
            gutters.gap_24,
            { paddingBottom: 24, flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          style={layout.flex_1}
        >
          <View style={heroContainerStyle}>
            <Cover uri={story.coverUri} width={120} />
            <View style={genresStyle}>
              {story.genres?.map((genre) => (
                <Tag key={genre} label={genre} tone="secondary" />
              ))}
              {story.status ? (
                <Tag
                  label={story.status === 'completed' ? 'Completed' : 'Ongoing'}
                  tone="primary"
                />
              ) : undefined}
            </View>
            <AppText style={{ textAlign: 'center' }} variant="headlineLg">
              {story.title}
            </AppText>
            <AuthorBar
              author={story.author}
              following={following}
              onToggleFollow={() => {
                setFollowing(!following);
              }}
            />
          </View>

          <View style={statsContainerStyle}>
            <StatItem
              label={t('story_detail.rating_label')}
              value={<RatingStars value={story.rating ?? 0} />}
            />
            <View
              style={{
                borderColor: colors.outlineVariant,
                borderLeftWidth: 1,
                height: 32,
              }}
            />
            <StatItem label={t('story_detail.views_label')} value={story.views ?? '0'} />
            <View
              style={{
                borderColor: colors.outlineVariant,
                borderLeftWidth: 1,
                height: 32,
              }}
            />
            <StatItem label={t('story_detail.chapters_label')} value={String(chapters.length)} />
          </View>

          <View style={sectionStyle}>
            <SectionHeader title={t('story_detail.synopsis_title')} />
            <AppText color="onSurfaceVariant" variant="bodyLg">
              {mockDescription}
            </AppText>
          </View>

          <View style={tabsContainerStyle}>
            <Tabs
              activeIndex={activeTab}
              onChange={setActiveTab}
              tabs={[
                t('story_detail.chapters_tab'),
                t('story_detail.reviews_tab'),
              ]}
            />
          </View>

          {activeTab === 0 ? (
            <View style={tabContentStyle}>
              {chapters.slice(0, 3).map((chapter) => (
                <ChapterListItem
                  chapter={chapter}
                  key={chapter.id}
                  onPress={() => {
                    navigation.navigate(Paths.Reader, { storyId: story.id });
                  }}
                />
              ))}
              <Button
                label={t('story_detail.see_all_chapters', {
                  count: chapters.length,
                })}
                onPress={() => {}}
                variant="outlined"
              />
            </View>
          ) : (
            <View style={tabContentStyle}>
              <AppText color="onSurfaceVariant" variant="bodyMd">
                {t('story_detail.no_reviews')}
              </AppText>
            </View>
          )}

          <View style={footerContainerStyle}>
            <AppText color="onSurfaceVariant" variant="labelSm">
              © 2024 NovaTales. Premium Literary Sanctuary.
            </AppText>
            <View style={footerLinksStyle}>
              <Pressable onPress={() => {}}>
                <AppText
                  color="primary"
                  style={{ textDecorationLine: 'underline' }}
                  variant="labelSm"
                >
                  Terms
                </AppText>
              </Pressable>
              <AppText color="onSurfaceVariant" variant="labelSm">
                |
              </AppText>
              <Pressable onPress={() => {}}>
                <AppText
                  color="primary"
                  style={{ textDecorationLine: 'underline' }}
                  variant="labelSm"
                >
                  Privacy
                </AppText>
              </Pressable>
              <AppText color="onSurfaceVariant" variant="labelSm">
                |
              </AppText>
              <Pressable onPress={() => {}}>
                <AppText
                  color="primary"
                  style={{ textDecorationLine: 'underline' }}
                  variant="labelSm"
                >
                  Support
                </AppText>
              </Pressable>
              <AppText color="onSurfaceVariant" variant="labelSm">
                |
              </AppText>
              <Pressable onPress={() => {}}>
                <AppText
                  color="primary"
                  style={{ textDecorationLine: 'underline' }}
                  variant="labelSm"
                >
                  Vietnam Office
                </AppText>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={ctaContainerStyle}>
          <View style={layout.flex_1}>
            <Button
              label={t('story_detail.add_to_library')}
              variant="outlined"
            />
          </View>
          <View style={layout.flex_1}>
            <Button
              label={t('story_detail.read_now')}
              onPress={() => {
                navigation.navigate(Paths.Reader, { storyId: story.id });
              }}
              variant="filled"
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

export default StoryDetail;
