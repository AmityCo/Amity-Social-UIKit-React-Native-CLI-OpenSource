module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./src'],
      },
    ],
    // Has to stay last: it rewrites the functions marked as worklets, and only
    // sees them once the other plugins have finished with the file.
    'react-native-worklets/plugin',
  ],
};
