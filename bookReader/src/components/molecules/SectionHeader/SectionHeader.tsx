import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from '@/components/atoms';

type Properties = {
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly title: string;
};

function SectionHeader({
  actionLabel = undefined,
  onAction = undefined,
  title,
}: Properties) {
  const { layout } = useTheme();

  return (
    <View style={[layout.row, layout.itemsCenter, layout.justifyBetween]}>
      <AppText color="onSurface" variant="headlineMd">
        {title}
      </AppText>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <AppText color="primary" variant="labelMd">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : undefined}
    </View>
  );
}

export default SectionHeader;
