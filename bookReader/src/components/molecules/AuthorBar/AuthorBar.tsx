import type { Author } from '@/models';

import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText, Avatar, Button } from '@/components/atoms';

type Properties = {
  readonly author: Author;
  readonly following?: boolean;
  readonly onPress?: () => void;
  readonly onToggleFollow?: () => void;
};

function AuthorBar({
  author,
  following = false,
  onPress = undefined,
  onToggleFollow = undefined,
}: Properties) {
  const { gutters, layout } = useTheme();

  return (
    <View style={[layout.row, layout.itemsCenter, gutters.gap_16]}>
      <Pressable
        accessibilityRole="button"
        disabled={!onPress}
        onPress={onPress}
        style={[layout.row, layout.itemsCenter, layout.flex_1, gutters.gap_16]}
      >
        <Avatar ring size={48} uri={author.avatarUri} />
        <View style={layout.flex_1}>
          <AppText color="onSurface" variant="labelMd">
            {author.name}
          </AppText>
          {author.handle ? (
            <AppText color="onSurfaceVariant" variant="labelSm">
              @{author.handle.replace(/^@/, '')}
            </AppText>
          ) : undefined}
        </View>
      </Pressable>
      {onToggleFollow ? (
        <Button
          label={following ? 'Đang theo dõi' : 'Theo dõi'}
          onPress={onToggleFollow}
          variant={following ? 'tonal' : 'outlined'}
        />
      ) : undefined}
    </View>
  );
}

export default AuthorBar;
