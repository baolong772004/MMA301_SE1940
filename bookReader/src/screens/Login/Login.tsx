import type { RootScreenProps } from '@/navigation/types';

import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';

import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { Button } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

/*
 * Cấu hình Google Sign-In.
 *
 * autoDetect sẽ tự lấy Web Client ID trong file
 * google-services.json của Firebase.
 */
GoogleOneTapSignIn.configure({
  webClientId: 'autoDetect',
});

function Login({ navigation }: RootScreenProps<Paths.Login>) {
  const { layout } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState<string | undefined>(undefined);
  const [googleLoading, setGoogleLoading] = useState(false);

  /**
   * Đăng nhập demo bằng username/password.
   */
  function handleLogin() {
    setError(undefined);

    const normalizedEmail = email.trim().toLowerCase();
    const enteredPassword = password;

    if (normalizedEmail.includes('admin') && enteredPassword === 'admin') {
      navigation.reset({
        index: 0,
        routes: [{ name: Paths.Admin }],
      });

      return;
    }

    if (normalizedEmail.includes('user') && enteredPassword === 'user') {
      navigation.reset({
        index: 0,
        routes: [{ name: Paths.Startup }],
      });

      return;
    }

    setError('Sai username hoặc password. Vui lòng thử lại.');
  }

  /**
   * Đăng nhập Google và xác thực với Firebase.
   */
  async function handleGoogleLogin() {
    if (googleLoading) {
      return;
    }

    setError(undefined);
    setGoogleLoading(true);

    try {
      /*
       * Kiểm tra máy Android có Google Play Services không.
       */
      await GoogleOneTapSignIn.checkPlayServices();

      /*
       * Thử đăng nhập với tài khoản đã từng được sử dụng.
       */
      let googleResponse = await GoogleOneTapSignIn.signIn();

      /*
       * Nếu chưa có tài khoản Google nào từng đăng nhập app,
       * mở màn hình để người dùng chọn tài khoản.
       */
      if (isNoSavedCredentialFoundResponse(googleResponse)) {
        googleResponse = await GoogleOneTapSignIn.createAccount();
      }

      /*
       * Trường hợp thiết bị vẫn chưa tìm được tài khoản,
       * mở màn hình đăng nhập Google đầy đủ.
       */
      if (isNoSavedCredentialFoundResponse(googleResponse)) {
        googleResponse = await GoogleOneTapSignIn.presentExplicitSignIn();
      }

      /*
       * Người dùng bấm hủy hoặc đăng nhập không thành công.
       */
      if (!isSuccessResponse(googleResponse)) {
        return;
      }

      const idToken = googleResponse.data?.idToken;

      if (!idToken) {
        throw new Error(
          'Google không trả về ID Token. Hãy kiểm tra lại cấu hình Firebase.',
        );
      }

      /*
       * Tạo Firebase credential từ Google ID Token.
       */
      const googleCredential = GoogleAuthProvider.credential(idToken);

      /*
       * Đăng nhập vào Firebase Authentication.
       */
      const firebaseResult = await signInWithCredential(
        getAuth(),
        googleCredential,
      );

      console.log('Firebase UID:', firebaseResult.user.uid);
      console.log('Google email:', firebaseResult.user.email);
      console.log('Google name:', firebaseResult.user.displayName);
      console.log('Google photo:', firebaseResult.user.photoURL);

      /*
       * Hiện tại tất cả tài khoản Google đều là User.
       *
       * Sau này có thể kiểm tra role trong Firestore
       * để chuyển Admin hoặc User.
       */
      navigation.reset({
        index: 0,
        routes: [{ name: Paths.Startup }],
      });
    } catch (loginError: unknown) {
      console.error('Google Firebase login error:', loginError);

      if (loginError instanceof Error) {
        setError(`Đăng nhập Google thất bại: ${loginError.message}`);
      } else {
        setError(
          'Đăng nhập Google thất bại. Vui lòng kiểm tra Firebase và thử lại.',
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          layout.flex_1,
          layout.itemsCenter,
          layout.justifyCenter,
          {
            backgroundColor: '#F5F5F7',
          },
        ]}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 400,
          }}
        >
          {/* Logo */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 30,
            }}
          >
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
              keyboardType="email-address"
              editable={!googleLoading}
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
              editable={!googleLoading}
              style={{
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 15,
                marginBottom: 20,
              }}
            />

            {/* Remember and Forgot Password */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                disabled={googleLoading}
                onPress={() => setRemember((current) => !current)}
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
                    borderColor: remember ? '#6B46C1' : '#999',
                    backgroundColor: remember ? '#6B46C1' : 'transparent',
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {remember && (
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>

                <Text style={{ marginLeft: 8 }}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity disabled={googleLoading}>
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

            {/* Error */}
            {error ? (
              <View
                style={{
                  backgroundColor: '#FFF0F0',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 15,
                }}
              >
                <Text
                  style={{
                    color: '#D32F2F',
                    lineHeight: 20,
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

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

            {/* Google Login */}
            <TouchableOpacity
              disabled={googleLoading}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              style={{
                height: 52,
                borderWidth: 1,
                borderColor: '#DDDDDD',
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              {googleLoading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#F4F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '700',
                        color: '#4285F4',
                      }}
                    >
                      G
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: '#333333',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Đăng nhập bằng Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

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

            {/* Demo accounts */}
            <View
              style={{
                marginTop: 30,
                backgroundColor: '#F4F4F6',
                borderRadius: 12,
                padding: 15,
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                  color: '#555',
                }}
              >
                Tài khoản demo
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 12,
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  disabled={googleLoading}
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
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                    }}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={googleLoading}
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
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: '700',
                    }}
                  >
                    User
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
