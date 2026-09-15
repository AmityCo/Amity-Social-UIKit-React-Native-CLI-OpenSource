// BannedMemberList — ported from AmityUiKitWeb
// v4/chat/features/group/banned-members/components/BannedMemberList.
//
// Lists banned members (memberships: ['banned']) reusing the shared MemberItem
// row. Web rendered MemberItem's generic ActionMenu from a one-item `unban`
// array; RN fills MemberItem's `trailing` slot with a small Popover + Menu that
// carries the single unban action (the banned list has no separate curated
// action component). The unban handler is supplied by useBannedGroupMembers.

// 1. React / RN imports
import { type ReactElement } from 'react';
import { FlatList, Pressable, View } from 'react-native';

// 2. Internal imports
import { MemberItem } from '../../../members/components/MemberItem';
import { EmptyState } from '../../../../../features/shared/components/EmptyState';
import { Menu } from '../../../../../../core/design/components/Menu';
import { Popover } from '../../../../../../core/design/components/Popover';
import { AmityIcon } from '../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';
import { resolveString } from '../../../../../../core/localization';
import { useChannelMembersCollection } from '../../../../../hooks/collections';
import { useStyles } from './styles';

// Local constants (mirror AmityUiKitWeb v4/chat/constants).
const LIST_PAGE_LIMIT = 20;
const LIST_SKELETON_ROW_COUNT = 9;

// 3. Types
type BannedMemberListProps = {
  channelId: string;
  search: string;
  onUnban: (user: Amity.InternalUser) => void;
};

// 4. Named function component
export function BannedMemberList({
  channelId,
  search,
  onUnban,
}: BannedMemberListProps) {
  const { styles } = useStyles();

  const { members, isLoadingFirstPage, isLoading, hasMore, loadMore } =
    useChannelMembersCollection({
      channelId,
      search,
      memberships: ['banned'],
      limit: LIST_PAGE_LIMIT,
    });

  if (members.length === 0 && !isLoading && !isLoadingFirstPage) {
    return <EmptyState variant="no-banned-users" />;
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
      style={styles.bannedMemberList}
      data={members}
      keyExtractor={(member) => member.userId}
      renderItem={({ item: member }) => {
        if (!member.user || !member.userId) return null;
        const memberUser = member.user;
        return (
          <MemberItem
            user={memberUser}
            isModerator={false}
            isCurrentUser={false}
            trailing={
              <Popover
                placement="bottom right"
                // eslint-disable-next-line react/no-unstable-nested-components -- Popover's trigger is a render-prop, not a component definition.
                trigger={({ openPopover }) => (
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
                      tokenColor={AmityColorToken.IconListLeadingDefaultDefault}
                    />
                  </Pressable>
                )}
              >
                {({ closePopover }) => (
                  <View style={styles.menuContainer}>
                    <Menu variant="chat" container="popover">
                      <Menu.Item
                        icon="ban-r"
                        label={resolveString('amity_chat_member_action_unban')}
                        typography="body"
                        onPress={() => {
                          closePopover();
                          onUnban(memberUser);
                        }}
                      />
                    </Menu>
                  </View>
                )}
              </Popover>
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
