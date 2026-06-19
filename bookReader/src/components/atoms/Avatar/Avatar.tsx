import { Image } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly ring?: boolean;
  readonly size?: number;
  readonly uri?: string;
};

function Avatar({ ring = false, size = 48, uri = undefined }: Properties) {
  const { colors } = useTheme();

  return (
    <Image
      source={uri ? { uri } : undefined}
      style={{
        backgroundColor: colors.surfaceContainerHigh,
        borderColor: colors.primaryContainer,
        borderRadius: size / 2,
        borderWidth: ring ? 2 : 0,
        height: size,
        width: size,
      }}
    />
  );
}

export default Avatar;
