import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { Paths } from '@/navigation/paths';
import type { MainTabScreenProps, RootStackParamList } from '@/navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks';
import { UserServices } from '@/services/users';
import { WalletServices } from '@/services/wallet';
import { AuthServices, parseApiError } from '@/services/auth';

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

  // Modals state
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [topupModalVisible, setTopupModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Form states
  const [loadingTopup, setLoadingTopup] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [selectedMethod, setSelectedMethod] = useState<'MOMO' | 'ZALOPAY' | 'CARD'>('MOMO');
  const [editName, setEditName] = useState('');
  const [editAvatarUri, setEditAvatarUri] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
        void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
        void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }
    }, [user?.id, queryClient]),
  );

  const { data: realProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => UserServices.getProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: meData } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => AuthServices.getMe(),
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
    email: meData?.email ?? user?.email ?? '',
    coinBalance: walletData?.coinBalance ?? 0,
    emailVerified: meData?.emailVerified ?? false,
    storiesCount: realProfile?.storiesCount ?? 0,
    followersCount: realProfile?.followersCount ?? 0,
    followingCount: realProfile?.followingCount ?? 0,
  };

  async function handleExecuteTopup() {
    const methodName = selectedMethod === 'MOMO' ? 'Ví MoMo' : selectedMethod === 'ZALOPAY' ? 'Ví ZaloPay' : 'Thẻ ATM/Visa';
    Alert.alert(
      'Xác nhận nạp xu (Thử nghiệm)',
      `Bạn đang thực hiện nạp ${selectedAmount} xu qua cổng ${methodName}.\n\nXác nhận thanh toán giả lập để nhận xu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán & Cộng xu',
          onPress: async () => {
            setLoadingTopup(true);
            try {
              const res = await WalletServices.topup(selectedAmount, selectedMethod);
              Alert.alert('Thành công', `Nạp xu thành công qua ${methodName}! Số dư ví mới: ${res.coinBalance} xu.`);
              setTopupModalVisible(false);
              await queryClient.invalidateQueries({ queryKey: ['wallet'] });
              await queryClient.invalidateQueries({ queryKey: ['auth-me'] });
            } catch (err: unknown) {
              const errorMsg = await parseApiError(err, 'Nạp xu thất bại.');
              Alert.alert('Lỗi', errorMsg);
            } finally {
              setLoadingTopup(false);
            }
          },
        },
      ],
    );
  }

  function openEditModal() {
    setEditName(profileInfo.name);
    setEditAvatarUri(profileInfo.avatarUri);
    setEditModalVisible(true);
  }

  async function handleSaveProfile() {
    const name = editName.trim();
    if (!name) {
      Alert.alert('Lỗi', 'Tên không được để trống.');
      return;
    }
    setLoadingEdit(true);
    try {
      await UserServices.updateProfile({
        avatarUri: editAvatarUri.trim() || undefined,
        name,
      });
      Alert.alert('Thành công', 'Đã cập nhật thông tin hồ sơ!');
      setEditModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    } catch (err: unknown) {
      const msg = await parseApiError(err, 'Cập nhật hồ sơ thất bại.');
      Alert.alert('Lỗi', msg);
    } finally {
      setLoadingEdit(false);
    }
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
        <View style={{ backgroundColor: meData?.role === 'ADMIN' ? '#FEE2E2' : meData?.role === 'WRITER' ? '#FEF3C7' : '#E0E7FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
          <AppText color={meData?.role === 'ADMIN' ? 'error' : 'primary'} variant="labelSm" style={{ fontWeight: '600' }}>
            {meData?.role === 'ADMIN' ? '🛡️ Quản trị viên' : meData?.role === 'WRITER' ? '✍️ Tác giả' : '📖 Độc giả'}
          </AppText>
        </View>
        <View style={gutters.marginTop_8}>
          <Button
            label={t('profile.edit_profile')}
            onPress={openEditModal}
            variant="tonal"
          />
        </View>
      </View>

      {/* Wallet Card */}
      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.outlineVariant,
          borderRadius: 16,
          borderWidth: 1,
          marginBottom: 16,
          padding: 20,
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <AppText color="onSurfaceVariant" variant="labelSm">Ví NovaTales</AppText>
            <AppText color="onSurface" style={{ marginVertical: 4 }} variant="headlineLg">
              {walletData?.coinBalance ?? 0} xu
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Nạp xu" onPress={() => setTopupModalVisible(true)} />
            <Button label="Lịch sử" onPress={() => setWalletModalVisible(true)} variant="outlined" />
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={statsRowStyle}>
        <Pressable onPress={() => navigation.navigate(Paths.Write)}>
          <StatItem
            label={t('profile.stories')}
            value={String(profileInfo.storiesCount)}
          />
        </Pressable>
        <Pressable onPress={() => Alert.alert('Người theo dõi', `Bạn có ${profileInfo.followersCount} độc giả đang theo dõi.`)}>
          <StatItem
            label={t('profile.followers')}
            value={String(profileInfo.followersCount)}
          />
        </Pressable>
        <Pressable onPress={() => Alert.alert('Đang theo dõi', `Bạn đang theo dõi ${profileInfo.followingCount} tác giả.`)}>
          <StatItem
            label={t('profile.following')}
            value={String(profileInfo.followingCount)}
          />
        </Pressable>
      </View>

      {/* Truyện công khai của tác giả */}
      <View style={{ marginVertical: 16 }}>
        <AppText color="onSurface" variant="headlineMd" style={{ marginBottom: 12 }}>
          Truyện đã sáng tác ({Array.isArray(authorStories) ? authorStories.length : 0})
        </AppText>
        {Array.isArray(authorStories) && authorStories.length > 0 ? (
          authorStories.map((item: any) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate(Paths.StoryDetail, { storyId: item.id })}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: colors.surfaceVariant, padding: 12, borderRadius: 12 }}
            >
              <Cover uri={item.coverUri} width={50} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText color="onSurface" variant="labelMd">{item.title}</AppText>
                <AppText color="onSurfaceVariant" variant="labelSm" numberOfLines={2}>{item.summary ?? item.description}</AppText>
              </View>
            </Pressable>
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

      {/* ── MODAL NẠP XU (TOPUP MODAL) ────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={topupModalVisible}
        onRequestClose={() => setTopupModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: 24, gap: 16, borderWidth: 1, borderColor: colors.outlineVariant }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText color="onSurface" variant="headlineMd">Nạp Xu Vào Ví</AppText>
              <Pressable onPress={() => setTopupModalVisible(false)}>
                <AppIcon name="close" size={24} color="onSurfaceVariant" />
              </Pressable>
            </View>

            <AppText color="onSurfaceVariant" variant="labelSm">Chọn số lượng xu nạp:</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[50, 100, 200, 500].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => setSelectedAmount(amount)}
                  style={{
                    backgroundColor: selectedAmount === amount ? colors.primaryContainer : colors.surfaceVariant,
                    borderColor: selectedAmount === amount ? colors.primary : colors.outlineVariant,
                    borderRadius: 10,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <AppText color={selectedAmount === amount ? 'primary' : 'onSurface'} variant="labelMd">
                    +{amount} xu
                  </AppText>
                </Pressable>
              ))}
            </View>

            <AppText color="onSurfaceVariant" variant="labelSm" style={{ marginTop: 8 }}>Chọn hình thức thanh toán:</AppText>
            <View style={{ gap: 8 }}>
              {[
                { id: 'MOMO', label: 'Ví điện tử MoMo' },
                { id: 'ZALOPAY', label: 'Ví điện tử ZaloPay' },
                { id: 'CARD', label: 'Thẻ ATM / Visa / Mastercard' },
              ].map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedMethod(method.id as any)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: selectedMethod === method.id ? colors.primaryContainer : colors.surfaceVariant,
                    borderColor: selectedMethod === method.id ? colors.primary : colors.outlineVariant,
                    borderRadius: 10,
                    borderWidth: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <AppText color={selectedMethod === method.id ? 'primary' : 'onSurface'} variant="bodyMd">
                    {method.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Button label="Hủy" variant="outlined" onPress={() => setTopupModalVisible(false)} fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Thanh toán" onPress={handleExecuteTopup} disabled={loadingTopup} fullWidth />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL CHỈNH SỬA HỒ SƠ ────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: 24, gap: 16, borderWidth: 1, borderColor: colors.outlineVariant }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText color="onSurface" variant="headlineMd">Sửa Hồ Sơ Cá Nhân</AppText>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <AppIcon name="close" size={24} color="onSurfaceVariant" />
              </Pressable>
            </View>

            <View style={{ gap: 6 }}>
              <AppText color="onSurfaceVariant" variant="labelSm">Tên hiển thị:</AppText>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập tên mới"
                placeholderTextColor={colors.onSurfaceVariant}
                style={{ borderWidth: 1, borderColor: colors.outlineVariant, color: colors.onSurface, borderRadius: 8, padding: 12, fontSize: 16 }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <AppText color="onSurfaceVariant" variant="labelSm">URL Avatar (Tùy chọn):</AppText>
              <TextInput
                value={editAvatarUri}
                onChangeText={setEditAvatarUri}
                placeholder="https://..."
                placeholderTextColor={colors.onSurfaceVariant}
                style={{ borderWidth: 1, borderColor: colors.outlineVariant, color: colors.onSurface, borderRadius: 8, padding: 12, fontSize: 14 }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Button label="Hủy" variant="outlined" onPress={() => setEditModalVisible(false)} fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Lưu lại" onPress={handleSaveProfile} disabled={loadingEdit} fullWidth />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wallet Transactions History Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={walletModalVisible}
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxWidth: 400, maxHeight: '80%', backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.outlineVariant }}>
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
                      borderBottomColor: colors.outlineVariant,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <AppText color="onSurface" variant="labelMd">
                        {tx.description || (tx.type === 'TOPUP' ? 'Nạp xu' : 'Mở khóa chương')}
                      </AppText>
                      <AppText color="onSurfaceVariant" variant="labelSm">
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
