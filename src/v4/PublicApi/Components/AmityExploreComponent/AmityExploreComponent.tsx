import * as React from 'react';

import { View } from 'react-native';
import { useStyles } from './styles';

import { AmityRecommendedCommunityComponent } from '../AmityRecommenedCommunityComponent/AmityRecommenedCommunityComponent';

export default function AmityExploreComponent() {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <AmityRecommendedCommunityComponent />
    </View>
  );
}
