import { ComponentID, PageID } from '../../../../../enums';
import { useBottomSheet } from '../../../../../../core/stores/slices/bottomSheetSlice';
import { useShareableLink } from '../../../../../../core/hooks/useShareableLink';
import { ShareableLinkModel } from '../../../../../../social/types';
import { CopyLinkAction } from '../../../../../elements/CopyLinkAction';
import { ShareAction } from '../../../../../elements/ShareAction';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useFollowInfo } from '../../../../../hooks/objects/user/useFollowInfo';
import useSocialSettings from '../../../../../../core/hooks/useSocialSettings';
import useAuth from '../../../../../../core/hooks/useAuth';

type UsePostShareActionParams = {
  postId: string;
  postData: Amity.Post | null;
  pageId?: PageID;
};

export function usePostShareAction({
  postId,
  postData,
  pageId = PageID.WildCardPage,
}: UsePostShareActionParams) {
  const { openBottomSheet, bottomSheetHeight } = useBottomSheet();
  const { client } = useAuth();
  const { socialSettings } = useSocialSettings();
  const { getShareLink } = useShareableLink();
  const myId = client?.userId;

  const { followInfo } = useFollowInfo({
    userId: postData?.targetType === 'user' ? postData?.targetId : undefined,
    enabled:
      postData?.targetType === 'user' &&
      !!postData?.targetId &&
      postData?.targetId !== myId,
  });

  const isMyPost = myId === postData?.creator?.userId;
  const isBlocked = followInfo?.status === 'blocked';
  const isFollowing = followInfo?.status === 'accepted';
  const isPrivateNetwork = socialSettings?.userPrivacySetting === 'private';

  const canShare =
    postData?.targetType === 'community'
      ? !!postData?.targetCommunity?.isPublic
      : isMyPost || (!isBlocked && (!isPrivateNetwork || isFollowing));

  const shareLink =
    canShare && postData
      ? getShareLink(ShareableLinkModel.posts, postId)
      : null;

  const handleSharePress = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    openBottomSheet({
      height: bottomSheetHeight[2],
      content: (
        <>
          <CopyLinkAction
            link={shareLink}
            pageId={pageId}
            componentId={ComponentID.post_content}
          />
          <ShareAction
            link={shareLink}
            pageId={pageId}
            componentId={ComponentID.post_content}
          />
        </>
      ),
    });
  };

  return { shareLink, handleSharePress };
}
