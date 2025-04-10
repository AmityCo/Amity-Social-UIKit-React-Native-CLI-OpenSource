import React, { FC } from 'react';
import { Text, FlatList, View } from 'react-native';
import { RecommendedCommunityItem } from './RecommenedCommunityItems/RecommenedCommunityItems';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import { ComponentID, ElementID, PageID } from '../../../enum';
import { useAmityElement } from '../../../hook';

type AmityRecommendedCommunityComponentProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

export const AmityRecommendedCommunityComponent: FC<
  AmityRecommendedCommunityComponentProps
> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.explore_recommended_title;

  const { config, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyles();
  const [recommendedCommunities, setRecommendedCommunities] = React.useState<
    Amity.Community[]
  >([]);
  // const [loading, setLoading] = React.useState(true);
  // const [error, setError] = React.useState(null);
  React.useEffect(() => {
    const subscriber = CommunityRepository.getRecommendedCommunities(
      {
        limit: 4,
      },
      ({ data, error, loading }) => {
        if (error) {
          // setError(error);
          return;
        }
        if (!loading && data) setRecommendedCommunities(data);
        // setLoading(loading);
      }
    );

    return () => {
      subscriber();
    };
  }, []);

  return (
    <View testID={accessibilityId}>
      <Text style={styles.headerText}>{config.text as string}</Text>
      <FlatList
        horizontal={true}
        data={recommendedCommunities}
        renderItem={({ item }) => <RecommendedCommunityItem community={item} />}
        keyExtractor={(item) => item.communityId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};
