import type { RootScreenProps } from '@/navigation/types';

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';
import { useUser } from '@/hooks';
import { FontFamily } from '@/theme/typography';
import { Button, AppText } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { AuthServices, parseApiError } from '@/services/auth';
import { storage } from '@/services/storage';
import { LocalNotificationServices } from '@/services/notifications/localNotificationService';

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const { layout } = useTheme();
  const { saveUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleLogin() {
    setError(undefined);
    setLoading(true);

    try {
      const response = await AuthServices.login({ email, password });
      storage.set('access_token', response.accessToken);
      storage.set('user_profile', JSON.stringify(response.user));
      await saveUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        photoURL: response.user.avatarUrl ?? response.user.avatarUri ?? undefined,
      });
      LocalNotificationServices.addNotification(
        `Chào mừng ${response.user.name} quay trở lại! Cùng bắt đầu khám phá thế giới truyện hôm nay nào.`,
        'star'
      );
      const isAdmin = response.user.role === 'ADMIN';
      navigation.reset({
        index: 0,
        routes: [{ name: isAdmin ? Paths.Admin : Paths.Startup }],
      });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Đăng nhập thất bại. Vui lòng thử lại.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter, { backgroundColor: '#F5F5F7' }]}
      >
        <View style={{ width: '90%', maxWidth: 400 }}>
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <AppText variant="headlineLg" style={{ color: '#5A46E8', fontFamily: FontFamily.merriweatherBold }}>
              NovaTales
            </AppText>
            <AppText variant="labelSm" style={{ color: '#777', marginTop: 8, fontFamily: FontFamily.jakarta }}>
              Premium Literary Sanctuary
            </AppText>
          </View>

          {/* Card */}
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <AppText variant="headlineLgMobile" style={{ marginBottom: 24, fontFamily: FontFamily.merriweatherBold }}>
              Đăng nhập
            </AppText>

            <AppText variant="labelMd" style={{ color: '#666', marginBottom: 8, fontFamily: FontFamily.jakartaMedium }}>
              Email
            </AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 20,
                fontFamily: FontFamily.jakarta,
                fontSize: 16,
                color: '#333',
              }}
            />

            <AppText variant="labelMd" style={{ color: '#666', marginBottom: 8, fontFamily: FontFamily.jakartaMedium }}>
              Mật khẩu
            </AppText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry
              style={{
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 20,
                fontFamily: FontFamily.jakarta,
                fontSize: 16,
                color: '#333',
              }}
            />

            {error ? (
              <View style={{ backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <AppText style={{ color: '#D32F2F', fontFamily: FontFamily.jakarta, fontSize: 14 }}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <Button
              label={loading ? 'Đang xử lý...' : 'Đăng nhập'}
              onPress={handleLogin}
              fullWidth
              disabled={loading || !email.trim() || !password}
            />

            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <TouchableOpacity onPress={() => navigation.navigate(Paths.Register)}>
                <AppText style={{ color: '#777', fontFamily: FontFamily.jakarta }}>
                  Chưa có tài khoản?{' '}
                  <AppText style={{ color: '#6B46C1', fontFamily: FontFamily.jakartaBold }}>
                    Đăng ký
                  </AppText>
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default Login;
