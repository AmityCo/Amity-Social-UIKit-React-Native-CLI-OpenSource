import React from 'react';
import { Text, FlatList } from 'react-native';

import { RecommendedCommunityItem } from './RecommenedCommunityItems/RecommenedCommunityItems';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';

export const AmityRecommendedCommunityComponent = () => {
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
    <>
      <Text style={styles.headerText}>Recommended for you</Text>
      <FlatList
        horizontal={true}
        data={recommendedCommunities}
        renderItem={({ item }) => <RecommendedCommunityItem community={item} />}
        keyExtractor={(item) => item.communityId}
        contentContainerStyle={{ gap: 16 }}
      />
    </>
  );
};
