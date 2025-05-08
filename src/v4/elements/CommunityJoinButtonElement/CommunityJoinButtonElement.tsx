import React, { FC, memo } from 'react';
import { TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useAmityElement, useJoinCommunity } from '../../hook';
import { Button } from '../../component/Button/Button';
import { plus } from '../../assets/icons';
import { SvgXml } from 'react-native-svg';

type CommunityJoinButtonType = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId?: string;
  onJoinSuccess?: () => void;
} & TouchableOpacityProps;

const CommunityJoinButton: FC<CommunityJoinButtonType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_join_button,
  });

  const { joinCommunity, isPending } = useJoinCommunity();

  const handleJoinCommunity = () => {
    if (!communityId) return;
    joinCommunity(communityId);
  };

  if (isExcluded) return null;

  return (
    <Button
      testID={accessibilityId}
      type="primary"
      icon={<SvgXml xml={plus()} />}
      themeStyle={themeStyles}
      onPress={handleJoinCommunity}
      disabled={isPending}
      {...props}
    >
      {config.text as string}
    </Button>
  );
};

export default memo(CommunityJoinButton);
