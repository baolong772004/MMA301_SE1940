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
import { FontFamily } from '@/theme/typography';
import { Button, AppText } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { AuthServices, parseApiError } from '@/services/auth';

function Register({ navigation }: RootScreenProps<Paths.Register>) {
  const { layout } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = name.trim() && isValidEmail && password.length >= 6;

  async function handleRegister() {
    setError(undefined);
    setLoading(true);

    try {
      const res = await AuthServices.register({ email, password, name, handle: handle.trim() || undefined });
      navigation.navigate(Paths.VerifyOtp, { email: res.email || email, devOtp: res.devOtp });
    } catch (err: unknown) {
      const errorMsg = await parseApiError(err, 'Đăng ký thất bại. Vui lòng thử lại.');
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
              Đăng ký
            </AppText>

            {[
              { label: 'Tên', value: name, setValue: setName, placeholder: 'Nhập tên' },
              { label: 'Email', value: email, setValue: setEmail, placeholder: 'Nhập email', keyboardType: 'email-address' },
              { label: 'Tên đăng nhập', value: handle, setValue: setHandle, placeholder: 'Nhập tên đăng nhập' },
              { label: 'Mật khẩu', value: password, setValue: setPassword, placeholder: 'Nhập mật khẩu', secure: true },
            ].map(({ label, value, setValue, placeholder, keyboardType, secure }) => (
              <View key={label} style={{ marginBottom: 16 }}>
                <AppText variant="labelMd" style={{ color: '#666', marginBottom: 8, fontFamily: FontFamily.jakartaMedium }}>
                  {label}
                </AppText>
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder={placeholder}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  keyboardType={keyboardType as 'default' | 'email-address' | undefined}
                  secureTextEntry={secure}
                  style={{
                    backgroundColor: '#F4F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontFamily: FontFamily.jakarta,
                    fontSize: 16,
                    color: '#333',
                  }}
                />
              </View>
            ))}

            {error ? (
              <View style={{ backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <AppText style={{ color: '#D32F2F', fontFamily: FontFamily.jakarta, fontSize: 14 }}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <Button
              label={loading ? 'Đang xử lý...' : 'Đăng ký'}
              onPress={handleRegister}
              fullWidth
              disabled={loading || !isFormValid}
            />

            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <AppText style={{ color: '#777', fontFamily: FontFamily.jakarta }}>
                  Đã có tài khoản?{' '}
                  <AppText style={{ color: '#6B46C1', fontFamily: FontFamily.jakartaBold }}>
                    Đăng nhập
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

export default Register;
