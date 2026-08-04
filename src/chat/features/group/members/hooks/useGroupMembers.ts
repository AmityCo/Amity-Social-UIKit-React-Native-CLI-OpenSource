// useGroupMembers — ported from AmityUiKitWeb
// v4/chat/features/group/members/hooks/useGroupMembers.
//
// Web computed the viewer's moderator status from `useChannelMyMembership` and
// navigated via the in-app ChatNavigationProvider (pop / push AddGroupMemberPage).
// RN reads moderator status through the shared `useChannelMyMembership` hook and
// takes navigation as callback props (the hosting page owns the stack, which is
// out of scope here): `onBack` defaults to `useChatNavigation().pop()`.

import { useChannelMyMembership } from '../../../../hooks/useChannelMyMembership';
import { useChatNavigation } from '../../../../hooks/useChatNavigation';

export type UseGroupMembersParams = {
  channelId: string;
  onBack?: () => void;
  onAddMember?: () => void;
};

export function useGroupMembers({
  channelId,
  onBack,
  onAddMember,
}: UseGroupMembersParams) {
  const { pop } = useChatNavigation();
  const { isViewerModerator } = useChannelMyMembership(channelId);

  const handleBack = onBack ?? pop;
  const handleOpenAddMember = onAddMember ?? (() => {});

  return {
    channelId,
    isViewerModerator,
    handleBack,
    handleOpenAddMember,
  };
}
