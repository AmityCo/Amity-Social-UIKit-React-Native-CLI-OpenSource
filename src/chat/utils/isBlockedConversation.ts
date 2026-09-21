// isBlockedConversation — true when `channel` is a 1:1 conversation whose other
// participant is in the viewer's blocked set. Group/community channels are never
// considered blocked. The "other participant" is derived from `previewMembers`
// the same way AmityChatListItem and useConversation do.

export function isBlockedConversation(
  channel: Amity.Channel,
  currentUserId: string | undefined,
  blockedUserIds: ReadonlySet<string>
): boolean {
  if (channel.type !== 'conversation' || blockedUserIds.size === 0) {
    return false;
  }
  const otherMember = channel.previewMembers?.find(
    (member) => member.userId !== currentUserId
  );
  return Boolean(otherMember && blockedUserIds.has(otherMember.userId));
}
