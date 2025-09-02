const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === '~') {
            return path.resolve(__dirname, 'src');
          }
          return path.join(__dirname, 'node_modules', name);
        },
      }
    ),
  },
  watchFolders: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'example'),
  ],
};

module.exports = mergeConfig(defaultConfig, config);
