import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { useState } from 'react';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps, RootStackParamList } from '@/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks';
import { UserServices } from '@/services/users';
import { WalletServices } from '@/services/wallet';
import { parseApiError } from '@/services/auth';
import { LocalNotificationServices } from '@/services/notifications/localNotificationService';

import { AppIcon, AppText, Avatar, Button, Cover } from '@/components/atoms';
import { SettingRow, StatItem } from '@/components/molecules';
import { ScreenContainer } from '@/components/templates';


type ProfileNavigationProp = StackNavigationProp<RootStackParamList>;

function Profile({ navigation }: MainTabScreenProps<Paths.Profile>) {
  const parentNavigation = navigation.getParent<ProfileNavigationProp>();
  const { colors, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const { user, clearUser } = useUser();
  const queryClient = useQueryClient();

  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [loadingTopup, setLoadingTopup] = useState(false);

  const { data: realProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => UserServices.getProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: authorStories } = useQuery({
    queryKey: ['author-stories', user?.id],
    queryFn: () => UserServices.getAuthorStories(user!.id),
    enabled: !!user?.id,
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => WalletServices.getWallet(),
  });

  const profileInfo = {
    name: realProfile?.name ?? user?.name ?? 'Người dùng',
    avatarUri: realProfile?.avatarUri ?? realProfile?.avatarUrl ?? user?.photoURL ?? '',
    email: user?.email ?? '',
    storiesCount: realProfile?.storiesCount ?? 0,
    followersCount: realProfile?.followersCount ?? 0,
    followingCount: realProfile?.followingCount ?? 0,
  };

  async function handleTopup(amount: number, method: string = 'MOMO') {
    setLoadingTopup(true);
    try {
      const res = await WalletServices.topup(amount, method);
      Alert.alert('Thành công', `Nạp xu thành công qua ${method}! Số dư xu hiện tại: ${res.coinBalance}`);
      LocalNotificationServices.addNotification(
        `Nạp tiền thành công! Bạn đã nạp ${amount} xu qua cổng ${method}. Số dư ví hiện tại là ${res.coinBalance} xu.`,
        'star'
      );
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Nạp xu thất bại.');
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoadingTopup(false);
    }
  }

  function promptTopup() {
    Alert.alert(
      'Nạp Xu (Thanh toán giả lập)',
      'Vui lòng chọn cổng thanh toán & số lượng xu:',
      [
        { text: '50 xu (Ví MoMo)', onPress: () => handleTopup(50, 'MOMO') },
        { text: '100 xu (Ví MoMo)', onPress: () => handleTopup(100, 'MOMO') },
        { text: '200 xu (Thẻ ATM/Card)', onPress: () => handleTopup(200, 'CARD') },
        { text: 'Hủy', style: 'cancel' },
      ],
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const headerStyle: any = [
    layout.itemsCenter,
    gutters.gap_12,
    gutters.marginVertical_24,
  ];

  const statsRowStyle: any = [
    layout.row,
    layout.itemsCenter,
    layout.justifyAround,
    gutters.paddingVertical_16,
    { borderBottomWidth: 1, borderColor: colors.outlineVariant, borderTopWidth: 1 },
    gutters.marginVertical_16,
  ];

  const menuStyle: any = [
    layout.col,
    gutters.marginTop_24,
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <ScreenContainer scroll padded title={t('profile.title')}>
      {/* Avatar & User Details */}
      <View style={headerStyle}>
        <Avatar size={96} uri={profileInfo.avatarUri} />
        <AppText color="onSurface" variant="headlineLg">
          {profileInfo.name}
        </AppText>
        <AppText color="onSurfaceVariant" variant="bodyMd">
          {profileInfo.email}
        </AppText>
        <View style={gutters.marginTop_8}>
          <Button
            label={t('profile.edit_profile')}
            onPress={() => {
              Alert.alert(t('profile.title'), t('profile.alert_edit'));
            }}
            variant="tonal"
          />
        </View>
      </View>

      {/* Wallet Card */}
      <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <AppText color="onSurfaceVariant" variant="labelSm">Ví NovaTales</AppText>
            <AppText color="onSurface" variant="headlineLg" style={{ marginVertical: 4 }}>
              {walletData?.coinBalance ?? 0} xu
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Nạp xu" onPress={promptTopup} disabled={loadingTopup} />
            <Button label="Lịch sử" variant="outlined" onPress={() => setWalletModalVisible(true)} />
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={statsRowStyle}>
        <StatItem
          label={t('profile.stories')}
          value={String(profileInfo.storiesCount)}
        />
        <StatItem
          label={t('profile.followers')}
          value={String(profileInfo.followersCount)}
        />
        <StatItem
          label={t('profile.following')}
          value={String(profileInfo.followingCount)}
        />
      </View>

      {/* Truyện công khai của tác giả */}
      <View style={{ marginVertical: 16 }}>
        <AppText color="onSurface" variant="headlineMd" style={{ marginBottom: 12 }}>
          Truyện đã sáng tác ({Array.isArray(authorStories) ? authorStories.length : 0})
        </AppText>
        {Array.isArray(authorStories) && authorStories.length > 0 ? (
          authorStories.map((item: any) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: colors.surfaceVariant, padding: 12, borderRadius: 12 }}>
              <Cover uri={item.coverUri} width={50} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText color="onSurface" variant="labelMd">{item.title}</AppText>
                <AppText color="onSurfaceVariant" variant="labelSm" numberOfLines={2}>{item.summary}</AppText>
              </View>
            </View>
          ))
        ) : (
          <View style={{ backgroundColor: colors.surfaceVariant, padding: 16, borderRadius: 12, alignItems: 'center' }}>
            <AppText color="onSurfaceVariant" variant="bodyMd">Chưa có truyện nào được xuất bản.</AppText>
          </View>
        )}
      </View>

      {/* Menu Options */}
      <View style={menuStyle}>
        <SettingRow
          iconName="theme"
          label={t('profile.settings')}
          onPress={() => {
            navigation.navigate(Paths.Settings);
          }}
        />
        <SettingRow
          iconName="fire"
          label={t('profile.streak')}
          onPress={() => {
            navigation.navigate(Paths.Streak);
          }}
        />
        <SettingRow
          iconName="person"
          label={t('profile.logout')}
          onPress={() => {
            clearUser();
            parentNavigation?.reset({ index: 0, routes: [{ name: Paths.Login }] });
          }}
        />
      </View>

      {/* Wallet Transactions History Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={walletModalVisible}
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxWidth: 400, maxHeight: '80%', backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <AppText color="onSurface" variant="headlineMd">Lịch sử giao dịch</AppText>
              <Pressable onPress={() => setWalletModalVisible(false)}>
                <AppText color="primary" variant="labelMd">Đóng</AppText>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.isArray(walletData?.transactions) && walletData.transactions.length > 0 ? (
                walletData.transactions.map((tx) => (
                  <View
                    key={tx.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEE',
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <AppText color="onSurface" variant="labelMd">
                        {tx.description || (tx.type === 'TOPUP' ? 'Nạp xu' : 'Mở khóa chương')}
                      </AppText>
                      <AppText color="onSurfaceVariant" variant="bodySm">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </AppText>
                    </View>
                    <AppText
                      color={tx.amount > 0 ? 'primary' : 'error'}
                      variant="labelMd"
                      style={{ fontWeight: 'bold' }}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} xu
                    </AppText>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <AppIcon color="onSurfaceVariant" name="wallet" size={48} />
                  <AppText color="onSurfaceVariant" variant="bodyMd" style={{ marginTop: 12 }}>
                    Chưa có giao dịch nào được thực hiện.
                  </AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

export default Profile;
