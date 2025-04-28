import React, { FC } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import CommunityRowItem from '../CommunityRowItem/CommunityRowItem';
import CommunityListSkeleton from '../CommunityListSkeleton/CommunityListSkeleton';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { ComponentID, PageID } from '../../enum';
import { useAmityComponent } from '../../hook';

type CommunitySearchResultProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  communities?: Amity.Community[];
  isLoading?: boolean;
  isFirstTimeLoading?: boolean;
  themeStyles?: MyMD3Theme;
  onNextPage?: () => void;
  onPressCommunity: ({
    communityId,
    communityName,
  }: {
    communityId: string;
    communityName: string;
  }) => void;
};

const CommunitySearchResult: FC<CommunitySearchResultProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.community_search_result,
  communities,
  isFirstTimeLoading,
  isLoading,
  onNextPage,
  onPressCommunity,
}) => {
  const { themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = {
    container: {
      flex: 1,
      marginTop: 16,
    },
    listSkeleton: {
      marginTop: 16,
      paddingHorizontal: 16,
    },
    list: {
      flex: 1,
      marginTop: 16,
    },
    listContent: {
      paddingHorizontal: 16,
      gap: 16,
    },
  };
  return (
    <>
      {isFirstTimeLoading && (
        <View style={styles.listSkeleton}>
          <CommunityListSkeleton
            themeStyle={themeStyles}
            amount={12}
            hasTitle={false}
          />
        </View>
      )}
      <FlatList
        onEndReached={() => {
          onNextPage?.();
        }}
        data={communities}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              onPressCommunity({
                communityId: item.communityId,
                communityName: item.displayName,
              })
            }
          >
            <CommunityRowItem
              community={item}
              pageId={pageId}
              componentId={componentId}
              showJoinButton={false}
            />
          </Pressable>
        )}
        keyExtractor={(item, index) => item.communityId + index}
        onEndReachedThreshold={0.5}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          isLoading && communities ? (
            <CommunityListSkeleton themeStyle={themeStyles} amount={4} />
          ) : null
        }
      />
    </>
  );
};

export default CommunitySearchResult;
