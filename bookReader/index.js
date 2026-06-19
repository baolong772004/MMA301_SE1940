import { registerRootComponent } from 'expo';

import App from './src/App';

// if (__DEV__) {
//   void import('@/reactotron.config');
// }

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the Expo Go / dev-client entry automatically.
registerRootComponent(App);
