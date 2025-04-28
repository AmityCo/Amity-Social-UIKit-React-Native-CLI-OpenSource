import { FlatList, Pressable, View } from 'react-native';
import React, { FC, memo, useCallback } from 'react';
import { useStyles } from './styles';
import { useAmityComponent, useCommunities } from '../../../hook/';
import { PageID, ComponentID } from '../../../enum';
import { useNavigation } from '@react-navigation/native';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import CommunityRowItem from '../../../component/CommunityRowItem/CommunityRowItem';
import CommunityListSkeleton from '../../../component/CommunityListSkeleton/CommunityListSkeleton';

type AmityMyCommunitiesComponentType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const AmityMyCommunitiesComponent: FC<AmityMyCommunitiesComponentType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const { isExcluded, accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { AmityMyCommunitiesComponentBehaviour } = useBehaviour();
  const styles = useStyles();
  const { communities, onNextCommunityPage, loading } = useCommunities();

  const onPressCommunity = useCallback(
    ({ communityId, communityName }: { communityId; communityName }) => {
      if (AmityMyCommunitiesComponentBehaviour.onPressCommunity)
        return AmityMyCommunitiesComponentBehaviour.onPressCommunity();
      navigation.navigate('CommunityHome', {
        communityId,
        communityName,
      });
    },
    [navigation, AmityMyCommunitiesComponentBehaviour]
  );

  const renderLoading = useCallback(() => {
    return (
      <View style={styles.listSkeleton}>
        <CommunityListSkeleton
          themeStyle={themeStyles}
          amount={12}
          hasTitle={false}
        />
      </View>
    );
  }, [themeStyles, styles.listSkeleton]);

  if (isExcluded) return null;

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      {loading && !communities && renderLoading()}
      <FlatList
        onEndReached={() => {
          onNextCommunityPage && onNextCommunityPage();
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
          loading && communities ? (
            <CommunityListSkeleton themeStyle={themeStyles} amount={4} />
          ) : null
        }
      />
    </View>
  );
};

export default memo(AmityMyCommunitiesComponent);
