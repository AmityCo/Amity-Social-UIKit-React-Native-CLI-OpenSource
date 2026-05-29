import useAuth from '../../hooks/useAuth';
import { useUser } from './useUser';
import useSocialSettings from '../core/hooks/useSocialSettings';
import { isAdmin } from '../utils/permissions';
import { useIsCommunityModerator } from './useIsCommunityModerator';

export function useStoryPermission(communityId?: string) {
  const { client } = useAuth();
  const { socialSettings } = useSocialSettings();
  const user = useUser(client?.userId || '');
  const { isCommunityModerator } = useIsCommunityModerator({
    userId: client?.userId || '',
    communityId: communityId || '',
  });

  const isGlobalAdmin = isAdmin(user?.roles);

  const hasStoryPermission = !communityId
    ? socialSettings?.story?.allowAllUserToCreateStory
    : socialSettings?.story?.allowAllUserToCreateStory ||
      isGlobalAdmin ||
      isCommunityModerator;

  return hasStoryPermission;
}
