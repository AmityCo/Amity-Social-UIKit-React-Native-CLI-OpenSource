import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import { useStyles } from './styles';
import { Typography } from '../../../../../components/Typography/Typography';

type CloseCommunityProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function CloseCommunity({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.close_community,
  ...props
}: CloseCommunityProps) {
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

export default CloseCommunity;
