import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export type DividerProps = {
  themeStyles?: MyMD3Theme;
};

const Divider: FC<DividerProps> = ({ themeStyles }) => {
  const styles = StyleSheet.create({
    divider: {
      height: 8,
      width: '100%',
      backgroundColor: themeStyles.colors.baseShade4,
    },
  });

  return <View style={styles.divider} />;
};

export default Divider;
