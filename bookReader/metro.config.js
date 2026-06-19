// Expo Metro config (SDK 54) with SVG-as-component support.
// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer/expo',
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (extension) => extension !== 'svg',
);
config.resolver.sourceExts.push('svg');
// Required by getAssetsContext (require.context) for icons/images.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
