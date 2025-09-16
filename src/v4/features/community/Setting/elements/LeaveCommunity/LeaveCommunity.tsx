import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useAmityElement } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { useStyles } from './styles';
import { Typography } from '~/v4/component/Typography/Typography';

type LeaveCommunityProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function LeaveCommunity({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.leave_community,
  ...props
}: LeaveCommunityProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      testID={accessibilityId}
      {...props}
    >
      <Typography.BodyBold style={styles.alertText}>
        {config?.text as string}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
}

export default LeaveCommunity;
