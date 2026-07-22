import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Pressable, View } from 'react-native';

import { useUser } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppText, Avatar, Button, Cover, Skeleton } from '@/components/atoms';
import { StatItem } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';

import { parseApiError } from '@/services/auth';
import { UserServices } from '@/services/users';

function UserProfile({ navigation, route }: RootScreenProps<Paths.UserProfile>) {
  const { userId } = route.params;
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { colors, gutters, layout } = useTheme();

  const profileQuery = useQuery({
    queryFn: () => UserServices.getProfile(userId),
    queryKey: ['user-profile', userId],
  });
  const storiesQuery = useQuery({
    queryFn: () => UserServices.getAuthorStories(userId),
    queryKey: ['author-stories', userId],
  });

  const profile = profileQuery.data;
  const stories = Array.isArray(storiesQuery.data) ? storiesQuery.data : [];
  const isMe = user?.id === userId;

  async function toggleFollow() {
    if (!profile || isMe) return;
    try {
      await (profile.isFollowing ? UserServices.unfollowUser(userId) : UserServices.followUser(userId));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-profile', userId] }),
        queryClient.invalidateQueries({ queryKey: ['author-profile', userId] }),
      ]);
    } catch (error: unknown) {
      Alert.alert(
        'Không thể cập nhật',
        await parseApiError(error, 'Thao tác theo dõi thất bại.'),
      );
    }
  }

  if (profileQuery.isLoading) {
    return (
      <ScreenContainer
        onLeftPress={() => { navigation.goBack(); }}
        showBack
        title="Trang cá nhân"
      >
        <View style={[layout.itemsCenter, gutters.gap_16]}>
          <Skeleton height={96} loading width={96} />
          <Skeleton height={24} loading width={180} />
          <Skeleton height={44} loading width={140} />
        </View>
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer
        onLeftPress={() => { navigation.goBack(); }}
        showBack
        title="Trang cá nhân"
      >
        <AppText color="error" style={{ textAlign: 'center' }} variant="bodyMd">
          Không tìm thấy người dùng này.
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      onLeftPress={() => { navigation.goBack(); }}
      showBack
      title="Trang cá nhân"
    >
      <View style={[layout.itemsCenter, gutters.gap_12]}>
        <Avatar ring size={96} uri={profile.avatarUri ?? profile.avatarUrl ?? undefined} />
        <AppText color="onSurface" variant="headlineLg">
          {profile.name}
        </AppText>
        <AppText color="onSurfaceVariant" variant="bodyMd">
          @{profile.handle?.replace(/^@/, '') ?? 'user'}
        </AppText>
        <View
          style={{
            backgroundColor: colors.surfaceVariant,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <AppText color="primary" variant="labelSm">
            {profile.role === 'WRITER' ? 'Tác giả' : profile.role === 'ADMIN' ? 'Quản trị viên' : 'Độc giả'}
          </AppText>
        </View>
        {isMe ? undefined : (
          <Button
            label={profile.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
            onPress={() => {
              void toggleFollow();
            }}
            variant={profile.isFollowing ? 'tonal' : 'filled'}
          />
        )}
      </View>

      <View
        style={[
          layout.row,
          layout.justifyAround,
          gutters.paddingVertical_16,
          { borderBottomWidth: 1, borderColor: colors.outlineVariant, borderTopWidth: 1 },
        ]}
      >
        <StatItem label="Truyện" value={String(profile.storiesCount)} />
        <StatItem label="Người theo dõi" value={String(profile.followersCount)} />
        <StatItem label="Đang theo dõi" value={String(profile.followingCount)} />
      </View>

      <View style={gutters.gap_12}>
        <AppText color="onSurface" variant="headlineMd">
          Truyện đã xuất bản ({stories.length})
        </AppText>
        {stories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => { navigation.navigate(Paths.StoryDetail, { storyId: story.id }); }}
            style={[
              layout.row,
              layout.itemsCenter,
              gutters.gap_12,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.outlineVariant,
                borderRadius: 12,
                borderWidth: 1,
                padding: 12,
              },
            ]}
          >
            <Cover uri={story.coverUri ?? ''} width={52} />
            <View style={layout.flex_1}>
              <AppText color="onSurface" variant="labelMd">
                {story.title}
              </AppText>
              <AppText color="onSurfaceVariant" numberOfLines={2} variant="bodyMd">
                {story.description ?? 'Chưa có mô tả.'}
              </AppText>
            </View>
          </Pressable>
        ))}
        {!storiesQuery.isLoading && stories.length === 0 ? (
          <AppText color="onSurfaceVariant" variant="bodyMd">
            Người dùng này chưa có truyện nào được xuất bản.
          </AppText>
        ) : undefined}
      </View>
    </ScreenContainer>
  );
}

export default UserProfile;
