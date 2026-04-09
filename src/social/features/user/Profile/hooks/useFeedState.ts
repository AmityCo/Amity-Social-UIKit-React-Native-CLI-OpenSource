import useAuth from '../../../../../core/hooks/useAuth';
import useSocialSettings from '../../../../../core/hooks/useSocialSettings';
import { useFollowInfo } from '../../../../hooks/objects';

type UseFeedStateParams = {
  userId: string;
};

export function useFeedState({ userId }: UseFeedStateParams) {
  const { client } = useAuth();
  const { socialSettings } = useSocialSettings();
  const { followInfo } = useFollowInfo({ userId, enabled: !!userId });

  const isMyProfile = client?.userId === userId;
  const isBlockedByMe = followInfo?.status === 'blocked';
  const isFollowing = followInfo?.status === 'accepted';
  const isPrivate =
    !isMyProfile &&
    socialSettings?.userPrivacySetting === 'private' &&
    !isFollowing;

  return {
    isBlockedByMe,
    isPrivate,
    feedEnabled: !isBlockedByMe && !isPrivate,
  };
}
