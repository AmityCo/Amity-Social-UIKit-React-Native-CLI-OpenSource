import React from 'react';
import { useStyles } from './styles';
import { FlatList, View } from 'react-native';
import { useCommunityMemberCollection } from '~/v4/hook/collections/useCommunityMemberCollection';
import MemberItem from '../MemberItem';
import MemberSkeleton from '~/v4/features/community/shared/components/MemberSkeleton';
import { MemberRoles } from '~/constants';

type ModeratorListProps = {
  community: Amity.Community;
};

function useModeratorList({ community }: ModeratorListProps) {
  const { styles, theme } = useStyles();
  const memberCollection = useCommunityMemberCollection({
    enabled: !!community,
    params: {
      communityId: community?.communityId,
      roles: [MemberRoles.COMMUNITY_MODERATOR],
      limit: 20,
    },
  });

  return { styles, theme, collection: memberCollection };
}

const ModeratorList = ({ community }: ModeratorListProps) => {
  const { styles, collection } = useModeratorList({
    community,
  });

  return (
    <View style={styles.container}>
      {collection.isLoading && (
        <View style={styles.skeletonContainer}>
          <MemberSkeleton />
          <MemberSkeleton />
          <MemberSkeleton />
        </View>
      )}
      <FlatList
        data={collection.data}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onEndReached={() => {
          if (collection.hasNextPage && !collection.isFetchingNextPage)
            collection.fetchNextPage?.();
        }}
        ListFooterComponent={
          collection.isFetchingNextPage ? (
            <View style={styles.skeletonContainer}>
              <MemberSkeleton />
              <MemberSkeleton />
              <MemberSkeleton />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <MemberItem
            member={item}
            key={item.userId}
            refreshMembers={collection.refetch}
            communityId={community.communityId}
          />
        )}
      />
    </View>
  );
};

export default ModeratorList;
