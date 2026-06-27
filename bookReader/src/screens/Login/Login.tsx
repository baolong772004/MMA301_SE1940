import type { RootScreenProps } from '@/navigation/types';

import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { Button, AppText } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  function handleLogin() {
    setError(undefined);
    const e = email.trim().toLowerCase();
    const p = password;

    // simple demo credentials and routing
    if (e.includes('admin') && p === 'admin') {
      navigation.reset({ index: 0, routes: [{ name: Paths.Admin }] });
      return;
    }

    if (e.includes('user') && p === 'user') {
      navigation.reset({ index: 0, routes: [{ name: Paths.Startup }] });
      return;
    }

    setError('Sai username hoặc password. Vui lòng thử lại.');
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          layout.flex_1,
          layout.itemsCenter,
          layout.justifyCenter,
          { backgroundColor: '#F5F5F7' },
        ]}
      >
        <View style={{ width: '90%', maxWidth: 400 }}>
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 42,
                fontWeight: '700',
                color: '#5A46E8',
              }}
            >
              NovaTales
            </Text>

            <Text
              style={{
                color: '#777',
                marginTop: 8,
              }}
            >
              Premium Literary Sanctuary
            </Text>
          </View>

          {/* Card */}
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
            {/* Title */}
            <Text
              style={{
                fontSize: 30,
                fontWeight: '700',
                marginBottom: 25,
              }}
            >
              Đăng nhập
            </Text>

            {/* Email */}
            <Text
              style={{
                color: '#999',
                marginBottom: 8,
              }}
            >
              Email hoặc Tên đăng nhập
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email hoặc tên đăng nhập"
              placeholderTextColor="#999"
              autoCapitalize="none"
              style={{
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 15,
                marginBottom: 20,
              }}
            />

            {/* Password */}
            <Text
              style={{
                color: '#999',
                marginBottom: 8,
              }}
            >
              Mật khẩu
            </Text>

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
                paddingVertical: 15,
                marginBottom: 20,
              }}
            />

            {/* Remember */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => setRemember(!remember)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderWidth: 1,
                    borderColor: '#999',
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {remember && <Text>✓</Text>}
                </View>

                <Text style={{ marginLeft: 8 }}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text
                  style={{
                    color: '#6B46C1',
                    fontWeight: '600',
                  }}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <Text
                style={{
                  color: 'red',
                  marginBottom: 10,
                }}
              >
                {error}
              </Text>
            )}

            {/* Login button */}
            <Button label="Đăng nhập" onPress={handleLogin} fullWidth />

            {/* Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 25,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#DDD',
                }}
              />

              <Text
                style={{
                  marginHorizontal: 10,
                  color: '#999',
                }}
              >
                Hoặc tiếp tục với
              </Text>

              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#DDD',
                }}
              />
            </View>

            {/* Social */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 12,
                  backgroundColor: '#F5F5F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>G</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 12,
                  backgroundColor: '#F5F5F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>f</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up */}
            <View
              style={{
                alignItems: 'center',
                marginTop: 25,
              }}
            >
              <Text style={{ color: '#999' }}>
                Chưa có tài khoản?{' '}
                <Text
                  style={{
                    color: '#6B46C1',
                    fontWeight: '700',
                  }}
                >
                  Đăng ký
                </Text>
              </Text>
            </View>

            {/* Demo account */}
            <View
              style={{
                marginTop: 30,
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                padding: 15,
              }}
            >
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setEmail('admin@novatales.com');
                    setPassword('admin');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: Paths.Admin }],
                    });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: '#6B46C1',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>
                    Đăng nhập Admin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setEmail('user@novatales.com');
                    setPassword('user');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: Paths.Startup }],
                    });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: '#E6E6EA',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#333', fontWeight: '700' }}>
                    Đăng nhập User
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

export default Login;
