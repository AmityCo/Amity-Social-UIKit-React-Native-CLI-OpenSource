import React, { useState } from 'react';
import { useStyles } from './styles';
import { FlatList, View } from 'react-native';
import SearchInput from '~/v4/component/SearchInput';
import { useCommunityMemberCollection } from '~/v4/hook/collections/useCommunityMemberCollection';
import MemberItem from '../MemberItem';
import { useSearchMemberByDisplayNameCollection } from '~/v4/hook/collections/useSearchMemberByDisplayNameCollection';
import MemberSkeleton from '~/v4/features/community/shared/components/MemberSkeleton';

type MemberListProps = {
  community: Amity.Community;
};

function useMemberList({ community }: MemberListProps) {
  const { styles, theme } = useStyles();
  const [search, setSearch] = useState('');
  const memberCollection = useCommunityMemberCollection({
    enabled: !!community,
    params: {
      communityId: community?.communityId,
      memberships: ['member'],
      limit: 20,
    },
  });

  const searchMemberCollection = useSearchMemberByDisplayNameCollection({
    params: {
      search,
      communityId: community?.communityId,
    },
    enabled: !!search?.trim() && !!community,
  });

  const collection = search?.trim() ? searchMemberCollection : memberCollection;

  return { styles, theme, search, setSearch, collection };
}

const MemberList = ({ community }: MemberListProps) => {
  const { search, setSearch, styles, collection } = useMemberList({
    community,
  });

  return (
    <View>
      <View style={styles.searchContainer}>
        <SearchInput
          inputProps={{
            value: search,
            onChangeText: setSearch,
            placeholder: 'Search member',
          }}
        />
      </View>
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

export default MemberList;
