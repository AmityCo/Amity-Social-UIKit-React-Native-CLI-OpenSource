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
import { useToast } from '../../../core/stores/slices/toastSlice';

type CommunityJoinButtonType = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId?: string;
  /** Community display name, used in the success toast ("You joined {name}"). */
  communityName?: string;
  size?: BUTTON_SIZE;
  onJoinSuccess?: () => void;
} & TouchableOpacityProps;

const CommunityJoinButton: FC<CommunityJoinButtonType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
  communityName,
  size = BUTTON_SIZE.SMALL,
  onJoinSuccess,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_join_button,
  });

  const { showToast } = useToast();
  const { refresh } = useCustomRankingGlobalFeed({
    enabled: false,
  });
  const { joinCommunity, isPending } = useJoinCommunity({
    onSuccess: () => {
      showToast({
        message: communityName
          ? `You joined ${communityName}.`
          : 'You joined the community.',
        type: 'success',
      });
      // Refresh the global feed so the joined community's posts appear.
      refresh();
      // Let the parent react (e.g. remove the community from the Explore list).
      onJoinSuccess?.();
    },
    onError: () => {
      showToast({
        message: 'Failed to join the community. Please try again.',
        type: 'informative',
      });
    },
  });

  const { handleGlobalBehavior } = useGlobalBehavior();

  const handleJoinCommunity = () => {
    if (!communityId) return;
    handleGlobalBehavior({
      defaultBehavior: () => joinCommunity(communityId),
      // Forwarded to handleVisitorUserAction so a visitor host can auto-join
      // this community after the visitor creates a profile / signs in.
      communityId,
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
