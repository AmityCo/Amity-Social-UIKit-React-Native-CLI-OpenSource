import React, { FC, memo, useCallback } from 'react';
import { Text, FlatList, View, Pressable } from 'react-native';
import { RecommendedCommunityItem } from './RecommenedCommunityItems/RecommenedCommunityItems';
import { useStyles } from './styles';
import { ComponentID, ElementID, PageID } from '../../../enum';
import { useAmityElement } from '../../../hook';
import { useExplore } from '../../../providers/ExploreProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { useNavigation } from '@react-navigation/native';

type AmityRecommendedCommunityComponentProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const AmityRecommendedCommunityComponent: FC<
  AmityRecommendedCommunityComponentProps
> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.explore_recommended_title;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { config, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles();
  const { recommendedCommunities } = useExplore();

  const onPressCommunity = useCallback(
    ({ communityId }: { communityId: string }) => {
      navigation.navigate('CommunityProfilePage', {
        communityId,
      });
    },
    [navigation]
  );

  return (
    <View testID={accessibilityId}>
      <Text style={styles.headerText}>{config.text as string}</Text>
      <FlatList
        horizontal={true}
        data={recommendedCommunities}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              onPressCommunity({
                communityId: item.communityId,
              })
            }
          >
            <RecommendedCommunityItem pageId={pageId} community={item} />
          </Pressable>
        )}
        keyExtractor={(item) => item.communityId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default memo(AmityRecommendedCommunityComponent);
