import React from 'react';
import { View, Text, StyleProp, TextStyle } from 'react-native';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useStyles } from './styles';

interface UserNameProps {
  name: string;
  pageId?: PageID;
  componentId?: ComponentID;
  textStyle?: StyleProp<TextStyle>;
}

export const UserName: React.FC<UserNameProps> = ({
  name,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  textStyle,
}) => {
  const elementId = ElementID.user_name;
  const theme = useTheme() as MyMD3Theme;
  const { isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyles(theme);

  if (isExcluded) return null;

  return (
    <View
      testID={accessibilityId}
      style={styles.userName__displayName__container}
    >
      <Text
        numberOfLines={4}
        ellipsizeMode="tail"
        style={[styles.userName__displayName__text, textStyle]}
      >
        {name}
      </Text>
    </View>
  );
};
