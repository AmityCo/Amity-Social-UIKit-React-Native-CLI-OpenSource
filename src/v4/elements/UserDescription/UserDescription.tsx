import React from 'react';
import { View, StyleProp, TextStyle } from 'react-native';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import ReadMore from '@fawazahmed/react-native-read-more';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useStyles } from './styles';

interface UserDescriptionProps {
  description?: string;
  pageId?: PageID;
  componentId?: ComponentID;
  textStyle?: StyleProp<TextStyle>;
}

export const UserDescription: React.FC<UserDescriptionProps> = ({
  description = '',
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  textStyle,
}) => {
  const elementId = ElementID.user_description;
  const theme = useTheme() as MyMD3Theme;
  const { isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyles(theme);

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId}>
      <ReadMore
        numberOfLines={4}
        style={[styles.userDescription__description__text, textStyle]}
        seeMoreStyle={styles.seeMoreStyle}
        expandOnly={true}
      >
        {description}
      </ReadMore>
    </View>
  );
};
