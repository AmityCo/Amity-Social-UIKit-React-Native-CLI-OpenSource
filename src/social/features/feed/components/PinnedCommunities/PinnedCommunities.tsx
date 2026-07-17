import { FC, memo, useCallback } from 'react';
import { Text, FlatList, View, Pressable } from 'react-native';
import { RecommendedCommunityItem } from '../RecommendedCommunities/RecommenedCommunityItems/RecommenedCommunityItems';
import { PinnedCommunityCard } from './PinnedCommunityCard';
import { useStyles } from './styles';
import { PageID } from '../../../../enums';
import { useExplore } from '../../../../providers/ExploreProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useNavigation } from '@react-navigation/native';

type AmityPinnedCommunitiesComponentProps = {
  pageId?: PageID;
};

// Admin-curated communities featured at the top of Explore (below the category
// chips, above "Recommended for you"). Reuses the Recommended card so the visual
// style matches, but with the action button hidden — pinned memberships are
// auto-joined (see ExploreProvider) and meant to feel permanent.
const AmityPinnedCommunitiesComponent: FC<
  AmityPinnedCommunitiesComponentProps
> = ({ pageId = PageID.WildCardPage }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = useStyles();
  const { pinnedCommunities } = useExplore();

  const onPressCommunity = useCallback(
    ({ communityId }: { communityId: string }) => {
      navigation.navigate('CommunityProfilePage', { communityId });
    },
    [navigation]
  );

  // Hide the whole section (header + cards) when there are no pinned
  // communities — no empty state.
  if (!pinnedCommunities?.length) return null;

  // Singular when there's exactly one pinned community, plural otherwise.
  const isSingle = pinnedCommunities.length === 1;
  const title = isSingle ? 'Welcome to the community' : 'Pinned communities';

  return (
    <View>
      <Text style={styles.headerText}>{title}</Text>
      {isSingle ? (
        // A single card fills the row (no carousel) so it doesn't leave a large
        // empty gap on the right.
        <Pressable
          style={styles.singleCardWrap}
          onPress={() =>
            onPressCommunity({
              communityId: pinnedCommunities[0].communityId,
            })
          }
        >
          <PinnedCommunityCard
            pageId={pageId}
            community={pinnedCommunities[0]}
          />
        </Pressable>
      ) : (
        <FlatList
          horizontal={true}
          data={pinnedCommunities}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                onPressCommunity({ communityId: item.communityId })
              }
            >
              <RecommendedCommunityItem
                pageId={pageId}
                community={item}
                hideActionButton
              />
            </Pressable>
          )}
          keyExtractor={(item) => item.communityId}
          contentContainerStyle={styles.listContainer}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default memo(AmityPinnedCommunitiesComponent);
