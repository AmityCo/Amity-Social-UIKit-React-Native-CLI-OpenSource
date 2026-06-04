import useAuth from '../../hooks/useAuth';
import { useUser } from './useUser';
import useSocialSettings from '../core/hooks/useSocialSettings';
import { checkStoryPermission, isAdmin } from '../utils/permissions';

export function useStoryPermission(communityId?: string) {
  const { client } = useAuth();
  const { socialSettings } = useSocialSettings();
  const user = useUser(client?.userId || '');

  const isGlobalAdmin = isAdmin(user?.roles);

  const hasStoryPermission = !communityId
    ? socialSettings?.story?.allowAllUserToCreateStory
    : socialSettings?.story?.allowAllUserToCreateStory ||
      isGlobalAdmin ||
      checkStoryPermission(client, communityId);

  return { hasStoryPermission };
}
