import ky from 'ky';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';

const getBaseUrl = () => {
  const envUrl = process.env.API_URL;
  if (envUrl) {
    let url = envUrl;
    if (Platform.OS === 'android' && url.includes('localhost')) {
      url = url.replace('localhost', '10.0.2.2');
    }
    return url.endsWith('/') ? url : `${url}/`;
  }

  // Tự động lấy IP máy dev từ Expo Metro khi chạy trên máy thật / giả lập
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:3000/`;
    }
  }

  // Fallback cho Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/';
  }

  // Fallback cho iOS Simulator hoặc Web
  return 'http://localhost:3000/';
};

const prefixUrl = getBaseUrl();

export const instance = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = storage.getString('access_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});
