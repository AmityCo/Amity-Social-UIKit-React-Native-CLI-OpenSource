const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const escape = require('escape-string-regexp');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pak.peerDependencies });

const defaultConfig = getDefaultConfig(__dirname);
// The example consumes the package SRC (via extraNodeModules alias), where a .ts and
// .json can share a basename (e.g. localization/defaults/en.ts + en.json). Metro's
// default sourceExts resolve .json before .ts, so `import { x } from './defaults/en'`
// would wrongly pick en.json. Put json LAST so the .ts wins. (Built consumers use en.js,
// which already resolves before json, so this only matters for src consumption.)
const sourceExts = [
  ...defaultConfig.resolver.sourceExts.filter((e) => e !== 'json'),
  'json',
];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we block them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blockList: modules.map(
      (m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
    ),

    extraNodeModules: modules.reduce(
      (acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      },
      {
        [pak.name]: root,
      }
    ),

    sourceExts,
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);
