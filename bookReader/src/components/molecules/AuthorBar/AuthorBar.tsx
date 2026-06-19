import { View } from 'react-native';

import type { Author } from '@/models';
import { useTheme } from '@/theme';

import { AppText, Avatar, Button } from '@/components/atoms';

type Properties = {
  readonly author: Author;
  readonly following?: boolean;
  readonly onToggleFollow?: () => void;
};

function AuthorBar({
  author,
  following = false,
  onToggleFollow = undefined,
}: Properties) {
  const { gutters, layout } = useTheme();

  return (
    <View style={[layout.row, layout.itemsCenter, gutters.gap_16]}>
      <Avatar ring size={48} uri={author.avatarUri} />
      <View style={layout.flex_1}>
        <AppText color="onSurface" variant="labelMd">
          {author.name}
        </AppText>
        {author.handle ? (
          <AppText color="onSurfaceVariant" variant="labelSm">
            {author.handle}
          </AppText>
        ) : undefined}
      </View>
      <Button
        label={following ? 'Following' : 'Follow'}
        onPress={onToggleFollow}
        variant={following ? 'tonal' : 'outlined'}
      />
    </View>
  );
}

export default AuthorBar;
