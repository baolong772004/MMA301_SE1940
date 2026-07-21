import { Pressable } from 'react-native';

import { useTheme } from '@/theme';
import type { Colors } from '@/theme/types/colors';

import AppIcon from '../AppIcon/AppIcon';
import AppText from '../AppText/AppText';

type Properties = {
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly icon?: string;
  readonly label: string;
  readonly onPress?: () => void;
  readonly variant?: Variant;
};

type Variant = 'filled' | 'outlined' | 'tonal';

const STYLE_BY_VARIANT: Record<
  Variant,
  { bg: 'transparent' | keyof Colors; border?: keyof Colors; fg: keyof Colors }
> = {
  filled: { bg: 'primary', fg: 'onPrimary' },
  outlined: { bg: 'transparent', border: 'primary', fg: 'primary' },
  tonal: { bg: 'primaryContainer', fg: 'onPrimaryContainer' },
};

function Button({
  disabled = false,
  fullWidth = false,
  icon = undefined,
  label,
  onPress = undefined,
  variant = 'filled',
}: Properties) {
  const { borders, colors, gutters, layout } = useTheme();
  const spec = STYLE_BY_VARIANT[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        layout.row,
        layout.itemsCenter,
        layout.justifyCenter,
        gutters.gap_8,
        gutters.paddingVertical_12,
        gutters.paddingHorizontal_24,
        borders.rounded_8,
        spec.border ? borders.w_1 : undefined,
        spec.border ? { borderColor: colors[spec.border] } : undefined,
        {
          backgroundColor:
            spec.bg === 'transparent' ? 'transparent' : colors[spec.bg],
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
      ]}
    >
      {icon ? <AppIcon color={spec.fg} name={icon} size={20} /> : undefined}
      <AppText color={spec.fg} variant="labelMd">
        {label}
      </AppText>
    </Pressable>
  );
}

export default Button;
