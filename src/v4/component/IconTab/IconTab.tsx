import React, { FC, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

type IconTabProps = {
  isActive: boolean;
  icon: React.ReactNode;
  themeStyles: MyMD3Theme;
};

const IconTab: FC<IconTabProps> = ({
  isActive,
  icon,
  themeStyles,
}: IconTabProps) => {
  const styles = StyleSheet.create({
    container: {
      width: 70,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    active: {
      borderBottomWidth: 2,
      borderBottomColor: themeStyles?.colors.primary,
    },
  });

  const containerStyle = isActive
    ? [styles.container, styles.active]
    : [styles.container];

  return <View style={containerStyle}>{icon}</View>;
};

export default memo(IconTab);
