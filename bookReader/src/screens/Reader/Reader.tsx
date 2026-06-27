/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-magic-numbers */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppIcon, AppText, Button, ProgressBar } from '@/components/atoms';
import { ScreenContainer } from '@/components/templates';

import { chapters } from '@/mocks/stories';

function Reader({ navigation }: RootScreenProps<Paths.Reader>) {
  const {
    backgrounds,
    borders,
    changeTheme,
    colors,
    gutters,
    layout,
    variant,
  } = useTheme();
  const { t } = useTranslation();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(1);

  const currentChapter =
    chapters.find((c) => c.index === currentChapterIndex) ?? chapters[0];
  const maxChapters = chapters.length;
  const progress = currentChapterIndex / maxChapters;

  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
  };

  const handlePrevious = () => {
    if (currentChapterIndex > 1) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < maxChapters) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const headerStyle: any = [
    layout.absolute,
    layout.top0,
    layout.left0,
    layout.right0,
    layout.row,
    layout.itemsCenter,
    layout.justifyBetween,
    backgrounds.surface,
    borders.wBottom_1,
    { borderColor: colors.outlineVariant, height: 56, zIndex: 10 },
    gutters.paddingHorizontal_24,
  ];

  const bottomStyle: any = [
    layout.absolute,
    layout.bottom0,
    layout.left0,
    layout.right0,
    backgrounds.surface,
    borders.wTop_1,
    { borderColor: colors.outlineVariant, zIndex: 10 },
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_16,
    gutters.gap_16,
  ];

  const modalContainerStyle: any = [
    layout.flex_1,
    layout.justifyEnd,
    { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  ];

  const sheetStyle: any = [
    backgrounds.surface,
    borders.roundedTop_16,
    gutters.paddingHorizontal_24,
    gutters.paddingVertical_24,
    gutters.gap_24,
  ];

  const rowStyle: any = [layout.row, layout.itemsCenter, layout.justifyBetween];

  const buttonAdjustStyle: any = [
    layout.justifyCenter,
    layout.itemsCenter,
    borders.rounded_8,
    borders.w_1,
    { borderColor: colors.outline, height: 44, width: 44 },
  ];

  const themeOptionStyle: any = [
    layout.flex_1,
    layout.itemsCenter,
    gutters.paddingVertical_12,
    borders.rounded_8,
    borders.w_1,
    { borderColor: colors.outline },
  ];

  const themeOptionActiveStyle: any = [
    { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer padded={false} scroll={true} showHeader={false}>
      <View style={[layout.flex_1, { backgroundColor: colors.surface }]}>
        <Pressable onPress={toggleControls} style={layout.flex_1}>
          <ScrollView
            contentContainerStyle={[
              gutters.paddingHorizontal_24,
              {
                alignSelf: 'center',
                maxWidth: 600,
                paddingBottom: 120,
                paddingTop: 80,
                width: '100%',
              },
            ]}
            showsVerticalScrollIndicator={false}
            style={layout.flex_1}
          >
            <AppText
              color="onSurface"
              style={{ fontSize, lineHeight: fontSize * 1.8 }}
              variant="readingText"
            >
              {currentChapter.title}
              {'\n\n'}
              {t('reader.mock_chapter_text')}
            </AppText>
          </ScrollView>
        </Pressable>

        {/* Overlay Header */}
        {controlsVisible ? (
          <View style={headerStyle}>
            <Pressable
              hitSlop={8}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <AppIcon color="primary" name="arrow_back" />
            </Pressable>
            <AppText
              color="onSurface"
              style={{ flex: 1, marginHorizontal: 16, textAlign: 'center' }}
              variant="headlineMd"
            >
              {currentChapter.title}
            </AppText>
            <Pressable
              hitSlop={8}
              onPress={() => {
                setSettingsVisible(true);
              }}
            >
              <AppIcon color="primary" name="settings" />
            </Pressable>
          </View>
        ) : undefined}

        {/* Overlay Bottom Bar */}
        {controlsVisible ? (
          <View style={bottomStyle}>
            <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
              <AppText color="onSurfaceVariant" variant="labelSm">
                {Math.round(progress * 100)}%
              </AppText>
              <View style={layout.flex_1}>
                <ProgressBar value={progress} />
              </View>
            </View>
            <View
              style={[
                layout.row,
                layout.itemsCenter,
                layout.justifyBetween,
                gutters.gap_16,
              ]}
            >
              <View style={layout.flex_1}>
                <Button
                  disabled={currentChapterIndex === 1}
                  label={t('reader.prev_chapter')}
                  onPress={handlePrevious}
                  variant="outlined"
                />
              </View>
              <View style={layout.flex_1}>
                <Button
                  disabled={currentChapterIndex === maxChapters}
                  label={t('reader.next_chapter')}
                  onPress={handleNext}
                  variant="filled"
                />
              </View>
            </View>
          </View>
        ) : undefined}

        {/* ReaderSettings Sheet Modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => {
            setSettingsVisible(false);
          }}
          transparent
          visible={settingsVisible}
        >
          <Pressable
            onPress={() => {
              setSettingsVisible(false);
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={modalContainerStyle}>
            <View style={sheetStyle}>
              <View style={rowStyle}>
                <AppText color="onSurface" variant="headlineMd">
                  {t('reader.settings_title')}
                </AppText>
                <Pressable
                  onPress={() => {
                    setSettingsVisible(false);
                  }}
                >
                  <AppText color="primary" variant="labelMd">
                    {t('reader.close')}
                  </AppText>
                </Pressable>
              </View>

              {/* Adjust font size */}
              <View style={rowStyle}>
                <AppText color="onSurface" variant="labelMd">
                  {t('reader.font_size')} ({fontSize}px)
                </AppText>
                <View style={[layout.row, layout.itemsCenter, gutters.gap_12]}>
                  <Pressable
                    disabled={fontSize <= 14}
                    onPress={() => {
                      setFontSize(Math.max(14, fontSize - 2));
                    }}
                    style={[
                      buttonAdjustStyle,
                      fontSize <= 14 && { opacity: 0.5 },
                    ]}
                  >
                    <AppText color="onSurface" variant="headlineMd">
                      -
                    </AppText>
                  </Pressable>
                  <Pressable
                    disabled={fontSize >= 32}
                    onPress={() => {
                      setFontSize(Math.min(32, fontSize + 2));
                    }}
                    style={[
                      buttonAdjustStyle,
                      fontSize >= 32 && { opacity: 0.5 },
                    ]}
                  >
                    <AppText color="onSurface" variant="headlineMd">
                      +
                    </AppText>
                  </Pressable>
                </View>
              </View>

              {/* Adjust theme */}
              <View style={rowStyle}>
                <AppText color="onSurface" variant="labelMd">
                  {t('reader.theme')}
                </AppText>
                <View
                  style={[
                    layout.row,
                    layout.flex_1,
                    gutters.gap_12,
                    { marginLeft: 24 },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      changeTheme('default');
                    }}
                    style={[
                      themeOptionStyle,
                      variant === 'default' && themeOptionActiveStyle,
                    ]}
                  >
                    <AppText
                      color={variant === 'default' ? 'primary' : 'onSurface'}
                      variant="labelSm"
                    >
                      {t('reader.theme_light')}
                    </AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      changeTheme('dark');
                    }}
                    style={[
                      themeOptionStyle,
                      variant === 'dark' && themeOptionActiveStyle,
                    ]}
                  >
                    <AppText
                      color={variant === 'dark' ? 'primary' : 'onSurface'}
                      variant="labelSm"
                    >
                      {t('reader.theme_dark')}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

export default Reader;
