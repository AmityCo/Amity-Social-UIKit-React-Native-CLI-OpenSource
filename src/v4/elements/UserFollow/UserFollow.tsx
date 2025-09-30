import React from 'react';
import { View } from 'react-native';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useStyles } from './styles';
import { Typography } from '~/v4/component/Typography/Typography';

interface UserFollowProps {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  count?: number;
}

export const UserFollow: React.FC<UserFollowProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  count = 0,
}) => {
  const theme = useTheme() as MyMD3Theme;
  const { isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyles(theme);

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId} style={styles.userFollow__container}>
      <Typography.Body style={styles.amountTextComponent}>
        {count}
      </Typography.Body>
      <Typography.Caption style={styles.textComponent}>
        {' '}
        {config.text as string}
      </Typography.Caption>
    </View>
  );
};
