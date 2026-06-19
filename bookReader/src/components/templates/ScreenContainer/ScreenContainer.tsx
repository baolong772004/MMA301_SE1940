import type { PropsWithChildren } from 'react';

import { ScrollView, View } from 'react-native';

import { useTheme } from '@/theme';

import { TopAppBar } from '@/components/organisms';
import { SafeScreen } from '@/components/templates';

type Properties = PropsWithChildren<{
  readonly isError?: boolean;
  readonly onLeftPress?: () => void;
  readonly onResetError?: () => void;
  readonly onRightPress?: () => void;
  readonly padded?: boolean;
  readonly rightIcon?: string;
  readonly scroll?: boolean;
  readonly showBack?: boolean;
  readonly showHeader?: boolean;
  readonly title?: string;
}>;

function ScreenContainer({
  children = undefined,
  isError = false,
  onLeftPress = undefined,
  onResetError = undefined,
  onRightPress = undefined,
  padded = true,
  rightIcon = 'search',
  scroll = true,
  showBack = false,
  showHeader = true,
  title = undefined,
}: Properties) {
  const { gutters, layout } = useTheme();

  const bodyStyle = [
    layout.flex_1,
    padded ? gutters.paddingHorizontal_24 : undefined,
  ];

  return (
    <SafeScreen isError={isError} onResetError={onResetError}>
      {showHeader ? (
        <TopAppBar
          onLeftPress={onLeftPress}
          onRightPress={onRightPress}
          rightIcon={rightIcon}
          showBack={showBack}
          title={title}
        />
      ) : undefined}

      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            padded ? gutters.paddingHorizontal_24 : undefined,
            gutters.paddingVertical_24,
            gutters.gap_24,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={bodyStyle}>{children}</View>
      )}
    </SafeScreen>
  );
}

export default ScreenContainer;
