import type { TextProps } from 'react-native';

import { Text } from 'react-native';

import { useTheme } from '@/theme';
import type { Colors } from '@/theme/types/colors';
import { typography } from '@/theme/typography';
import type { TypographyVariant } from '@/theme/typography';

type Properties = {
  readonly color?: keyof Colors;
  readonly variant?: TypographyVariant;
} & TextProps;

function AppText({
  children,
  color = 'onSurface',
  style,
  variant = 'bodyMd',
  ...props
}: Properties) {
  const { colors } = useTheme();

  return (
    <Text
      {...props}
      style={[typography[variant], { color: colors[color] }, style]}
    >
      {children}
    </Text>
  );
}

export default AppText;
