module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
          extensions: ['.js', '.json', '.ts', '.tsx'],
          root: ['./src'],
        },
      ],
      'inline-dotenv',
      '@babel/plugin-transform-export-namespace-from',
      'react-native-worklets/plugin', // reanimated 4 — must stay last
    ],
  };
};
