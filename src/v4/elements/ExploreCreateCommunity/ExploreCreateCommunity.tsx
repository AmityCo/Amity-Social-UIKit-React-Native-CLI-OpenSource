import React, { FC, memo } from 'react';
import { TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useAmityElement } from '../../hook';
import { Button } from '../../component/Button/Button';
import { plus } from '../../assets/icons';

type ExploreCreateCommunityType = {
  pageId?: PageID;
  componentId?: ComponentID;
} & TouchableOpacityProps;

const ExploreCreateCommunity: FC<ExploreCreateCommunityType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.explore_create_community,
  });

  if (isExcluded) return null;

  return (
    <Button
      testID={accessibilityId}
      type="primary"
      icon={plus()}
      themeStyle={themeStyles}
      {...props}
    >
      {(config?.text as string) || 'Create community'}
    </Button>
  );
};

export default memo(ExploreCreateCommunity);
