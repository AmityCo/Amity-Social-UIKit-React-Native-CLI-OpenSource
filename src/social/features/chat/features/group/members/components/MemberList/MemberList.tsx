// MemberList — ported from AmityUiKitWeb
// v4/chat/features/group/members/components/MemberList.
//
// The searchable member/moderator list. Web used an IntersectionObserver sentinel
// + `useChannelMembersCollection`; RN uses that same collection hook (direct SDK
// subscription) + a FlatList `onEndReached`. Web built the per-member action
// array inline and rendered its own ActionMenu; RN delegates that to the curated
// AmityGroupMemberActionComponent, passed into MemberItem's generic `trailing`
// slot. The current user is ordered first and global-banned users filtered out,
// matching web. `isViewerModerator` comes from the shared useChannelMyMembership.

// 1. React / RN imports
import { useMemo, type ReactElement } from 'react';
import { FlatList, Pressable } from 'react-native';

// 2. Internal imports
import { MemberItem } from '../MemberItem';
import { AmityGroupMemberActionComponent } from '../../../../../components/AmityGroupMemberActionComponent';
import { EmptyState } from '../../../../../features/shared/components/EmptyState';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { MemberRoles } from '../../../../../../../../core/constants';
import { isModerator } from '../../../../../../../../core/utils/role';
import { useChannelMembersCollection } from '../../../../../hooks/collections';
import { useChannelMyMembership } from '../../../../../hooks/useChannelMyMembership';
import { useCurrentUserId } from '../../../../../hooks/useCurrentUserId';
import { useStyles } from './styles';

// Local constants (mirror AmityUiKitWeb v4/chat/constants).
const LIST_PAGE_LIMIT = 20;
const LIST_SKELETON_ROW_COUNT = 9;

// 3. Types
type MemberListProps = {
  channelId: string;
  search: string;
  onlyModerators: boolean;
};

// 4. Named function component
export function MemberList({
  channelId,
  search,
  onlyModerators,
}: MemberListProps) {
  const { styles } = useStyles();
  const currentUserId = useCurrentUserId();
  const { isViewerModerator } = useChannelMyMembership(channelId);

  const { members, isLoadingFirstPage, isLoading, hasMore, loadMore } =
    useChannelMembersCollection({
      channelId,
      search,
      memberships: ['member', 'muted'],
      roles: onlyModerators ? [MemberRoles.CHANNEL_MODERATOR] : undefined,
      limit: LIST_PAGE_LIMIT,
    });

  const visibleMembers = useMemo(
    () => members.filter((m) => !m.user?.isGlobalBanned),
    [members]
  );

  const orderedMembers = useMemo(() => {
    if (!currentUserId) return visibleMembers;
    const self = visibleMembers.find((m) => m.userId === currentUserId);
    if (!self) return visibleMembers;
    if (onlyModerators && !isModerator(self.roles)) return visibleMembers;
    const rest = visibleMembers.filter((m) => m.userId !== currentUserId);
    return [self, ...rest];
  }, [visibleMembers, currentUserId, onlyModerators]);

  if (orderedMembers.length === 0 && !isLoading && !isLoadingFirstPage) {
    return <EmptyState variant="no-members" />;
  }

  const footer: ReactElement | null =
    isLoadingFirstPage || isLoading ? (
      <>
        {Array.from({ length: LIST_SKELETON_ROW_COUNT }).map((_, i) => (
          <MemberItem.Skeleton key={`skeleton-${i}`} />
        ))}
      </>
    ) : null;

  return (
    <FlatList
      style={styles.memberList}
      data={orderedMembers}
      keyExtractor={(member) => member.userId}
      renderItem={({ item: member }) => {
        if (!member.user || !member.userId) return null;
        const isCurrentUser = member.userId === currentUserId;
        const isMemberModerator = isModerator(member.roles);
        const memberUser = member.user;

        return (
          <MemberItem
            user={memberUser}
            isModerator={isMemberModerator}
            isCurrentUser={isCurrentUser}
            isMuted={!!member.isMuted}
            isViewerModerator={isViewerModerator}
            trailing={
              isCurrentUser ? undefined : (
                <AmityGroupMemberActionComponent
                  channelId={channelId}
                  user={memberUser}
                  isMemberModerator={isMemberModerator}
                  isViewerModerator={isViewerModerator}
                  // eslint-disable-next-line react/no-unstable-nested-components -- Popover's anchor is a render-prop, not a component definition.
                  anchor={({ openPopover }) => (
                    <Pressable
                      style={styles.actionButton}
                      onPress={openPopover}
                      accessibilityRole="button"
                      accessibilityLabel={`Actions for ${
                        memberUser.displayName ?? memberUser.userId
                      }`}
                    >
                      <AmityIcon
                        name="ellipsis-r"
                        size={24}
                        tokenColor={
                          AmityColorToken.IconListLeadingDefaultDefault
                        }
                      />
                    </Pressable>
                  )}
                />
              )
            }
          />
        );
      }}
      onEndReachedThreshold={0.7}
      onEndReached={() => {
        if (hasMore && !isLoadingFirstPage && !isLoading) loadMore();
      }}
      ListFooterComponent={footer}
    />
  );
}
