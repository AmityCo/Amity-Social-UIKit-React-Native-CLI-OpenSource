import useAuth from '../../../../core/hooks/useAuth';
import { Permissions } from '../../../../core/constants';

/**
 * Web parity: useEventPermission — create/update/delete event permissions,
 * always false for visitors. Checks the current-user (global) permission
 * first, then the community-scoped permission when a communityId is given.
 */
export const useEventPermission = (communityId?: string) => {
  const { client, isVisitorOrBot } = useAuth();
  const amityClient = client as Amity.Client | null;

  const checkPermission = (permission: string): boolean => {
    if (isVisitorOrBot || !amityClient) return false;
    if (amityClient.hasPermission(permission).currentUser()) return true;
    if (communityId) {
      return !!amityClient.hasPermission(permission).community(communityId);
    }
    return false;
  };

  return {
    hasCreateEventPermission: checkPermission(
      Permissions.CreateEventPermission
    ),
    hasUpdateEventPermission: checkPermission(
      Permissions.UpdateEventPermission
    ),
    hasDeleteEventPermission: checkPermission(
      Permissions.DeleteEventPermission
    ),
  };
};
