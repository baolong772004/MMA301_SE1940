import Reactotron from 'reactotron-react-native';

// MMKV plugin removed: storage is now AsyncStorage-backed for Expo Go.
Reactotron.configure({
  name: 'NovaTales',
})
  .useReactNative()
  .connect();
