import useAuth from '../../../../../core/hooks/useAuth';
import useSocialSettings from '../../../../../core/hooks/useSocialSettings';
import { useFollowInfo } from '../../../../hooks/objects';

type UseFeedStateParams = {
  userId: string;
  /** Pass the already-fetched isBrand value from the parent to avoid a redundant user subscription. */
  isBrand?: boolean;
  /**
   * While true, brand status is still unknown for non-owner viewers.
   * feedEnabled is held false to prevent a privacy flash before isBrand resolves.
   */
  isUserLoading?: boolean;
};

export function useFeedState({
  userId,
  isBrand,
  isUserLoading,
}: UseFeedStateParams) {
  const { client } = useAuth();
  const { socialSettings } = useSocialSettings();
  const { followInfo } = useFollowInfo({ userId, enabled: !!userId });

  const isMyProfile = client?.userId === userId;
  const isBlockedByMe = followInfo?.status === 'blocked';
  const isFollowing = followInfo?.status === 'accepted';
  const isPrivate =
    !isMyProfile &&
    (isBrand || socialSettings?.userPrivacySetting === 'private') &&
    !isFollowing;

  // Hold feedEnabled false while the user object is still loading so brand-private
  // profiles don't flash feed content before isBrand is known.
  const isBrandResolved = isMyProfile || !isUserLoading;
  const feedEnabled = isBrandResolved && !isBlockedByMe && !isPrivate;

  return {
    isBlockedByMe,
    isPrivate,
    feedEnabled,
  };
}
