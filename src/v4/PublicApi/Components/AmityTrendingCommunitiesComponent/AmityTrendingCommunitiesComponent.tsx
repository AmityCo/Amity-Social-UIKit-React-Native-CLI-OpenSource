import React, { FC, memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
import { useStyles } from './styles';
import { useAmityComponent } from '../../../hook';
import TrendingCommunityTitleComponent from './TrendingCommunityTitle/TrendingCommunityTitle';
import CommunityRowItem from '../../../component/CommunityRowItem/CommunityRowItem';
import { useExplore } from '../../../providers/ExploreProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { useNavigation } from '@react-navigation/native';

type AmityTrendingCommunitiesCommunityProps = {
  pageId?: PageID;
};

const AmityTrendingCommunitiesCommunity: FC<
  AmityTrendingCommunitiesCommunityProps
> = ({ pageId = PageID.WildCardPage }) => {
  const componentId = ComponentID.trending_communities;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });
  const { trendingCommunities } = useExplore();
  const styles = useStyles();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCommunity = useCallback(
    ({ communityId, communityName }: { communityId; communityName }) => {
      navigation.navigate('CommunityHome', {
        communityId,
        communityName,
      });
    },
    [navigation]
  );

  if (isExcluded || trendingCommunities?.length === 0) return null;

  return (
    <View testID={accessibilityId}>
      <TrendingCommunityTitleComponent pageId={pageId} />
      <View style={styles.container}>
        {trendingCommunities?.map((community, index) => {
          return (
            <Pressable
              onPress={() =>
                onPressCommunity({
                  communityId: community.communityId,
                  communityName: community.displayName,
                })
              }
            >
              <CommunityRowItem
                pageId={pageId}
                community={community}
                label={`0${index + 1}`}
                componentId={componentId}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default memo(AmityTrendingCommunitiesCommunity);
