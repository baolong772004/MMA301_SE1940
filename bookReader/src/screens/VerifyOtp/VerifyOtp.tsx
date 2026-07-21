import type { RootScreenProps } from '@/navigation/types';

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';
import { Button } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { AuthServices, parseApiError } from '@/services/auth';
import { storage } from '@/services/storage';
import { useUser } from '@/hooks';

function VerifyOtp({ navigation, route }: RootScreenProps<Paths.VerifyOtp>) {
  const { layout } = useTheme();
  const { email, devOtp } = route.params;
  const { saveUser } = useUser();

  const [code, setCode] = useState(devOtp ?? '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined);

  async function handleVerify() {
    setError(undefined);
    setInfoMessage(undefined);
    setLoading(true);

    try {
      const response = await AuthServices.verifyOtp({ email, code });
      storage.set('access_token', response.accessToken);
      storage.set('user_profile', JSON.stringify(response.user));
      await saveUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        photoURL: response.user.avatarUrl ?? response.user.avatarUri ?? undefined,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: Paths.Startup }],
      });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Mã OTP không đúng hoặc đã hết hạn.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(undefined);
    setInfoMessage(undefined);
    setResending(true);

    try {
      const res = await AuthServices.resendOtp({ email });
      if (res.devOtp) {
        setCode(res.devOtp);
      }
      setInfoMessage(res.message || 'Đã gửi lại mã OTP thành công.');
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Gửi lại OTP thất bại.');
      setError(errorMsg);
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter, { backgroundColor: '#F5F5F7' }]}
      >
        <View style={{ width: '90%', maxWidth: 400 }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 25,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 30, fontWeight: '700', marginBottom: 10 }}>Xác thực OTP</Text>
            <Text style={{ color: '#666', marginBottom: 25 }}>Nhập mã OTP đã gửi đến {email}</Text>

            <Text style={{ color: '#999', marginBottom: 8 }}>Mã OTP</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Nhập 6 số OTP"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="number-pad"
              maxLength={6}
              style={{
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 15,
                marginBottom: 20,
                fontSize: 20,
                textAlign: 'center',
                letterSpacing: 8,
              }}
            />

            {error ? (
              <View style={{ backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginBottom: 15 }}>
                <Text style={{ color: '#D32F2F' }}>{error}</Text>
              </View>
            ) : null}

            {infoMessage ? (
              <View style={{ backgroundColor: '#EBF8FF', borderRadius: 10, padding: 12, marginBottom: 15 }}>
                <Text style={{ color: '#2B6CB0' }}>{infoMessage}</Text>
              </View>
            ) : null}

            <Button label={loading ? 'Đang xử lý...' : 'Xác thực'} onPress={handleVerify} fullWidth disabled={loading || code.length < 6} />

            <TouchableOpacity style={{ alignItems: 'center', marginTop: 20 }} onPress={handleResendOtp} disabled={resending}>
              <Text style={{ color: '#6B46C1', fontWeight: '600' }}>
                {resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default VerifyOtp;
