import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import { useStyles } from './styles';
import { Typography } from '../../../../../components/Typography/Typography';

type CloseCommunityDescriptionProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function CloseCommunityDescription({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.close_community_description,
  ...props
}: CloseCommunityDescriptionProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <Typography.Caption
      style={styles.container}
      testID={accessibilityId}
      {...props}
    >
      {config?.text as string}
    </Typography.Caption>
  );
}

export default CloseCommunityDescription;
