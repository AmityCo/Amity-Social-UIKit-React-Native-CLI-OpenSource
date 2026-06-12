import { FC, memo } from 'react';
import { TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';
import {
  useAmityElement,
  useGlobalBehavior,
  useJoinCommunity,
} from '../../hooks';
import { Button, BUTTON_SIZE } from '../../components/Button/Button';
import { plus } from '../../../core/assets/icons';
import { useCustomRankingGlobalFeed } from '../../hooks/useCustomRankingGlobalFeed';

type CommunityJoinButtonType = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId?: string;
  size?: BUTTON_SIZE;
  onJoinSuccess?: () => void;
} & TouchableOpacityProps;

const CommunityJoinButton: FC<CommunityJoinButtonType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
  size = BUTTON_SIZE.SMALL,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_join_button,
  });

  const { refresh, globalFeedPosts } = useCustomRankingGlobalFeed({
    enabled: false,
  });
  const { joinCommunity, isPending } = useJoinCommunity({
    onSuccess: () => {
      globalFeedPosts.length === 0 && refresh();
    },
  });

  const { handleGlobalBehavior } = useGlobalBehavior();

  const handleJoinCommunity = () => {
    if (!communityId) return;
    handleGlobalBehavior({
      defaultBehavior: () => joinCommunity(communityId),
    });
  };

  if (isExcluded) return null;

  return (
    <Button
      testID={accessibilityId}
      type="primary"
      icon={plus()}
      iconProps={{
        xml: plus(),
        color: themeStyles.isDarkTheme
          ? themeStyles.colors.base
          : themeStyles.colors.baseShade4,
      }}
      onPress={handleJoinCommunity}
      disabled={isPending}
      size={size}
      {...props}
    >
      {config?.text || 'Join'}
    </Button>
  );
};

export default memo(CommunityJoinButton);
