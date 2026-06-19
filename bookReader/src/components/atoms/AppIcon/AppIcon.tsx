import { useTheme } from '@/theme';
import type { Colors } from '@/theme/types/colors';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly color?: keyof Colors;
  readonly name: string;
  readonly size?: number;
};

/**
 * Material-style icon. SVGs in `theme/assets/icons` declare no `fill` on their
 * paths, so the `fill` set here cascades from the root <Svg> and recolors them.
 */
function AppIcon({ color = 'onSurface', name, size = 24 }: Properties) {
  const { colors } = useTheme();

  return (
    <IconByVariant
      fill={colors[color]}
      height={size}
      path={name}
      width={size}
    />
  );
}

export default AppIcon;
