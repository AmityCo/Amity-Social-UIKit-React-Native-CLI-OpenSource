import * as React from 'react';

import { View } from 'react-native';
import { useStyles } from './styles';
import { AmityRecommendedCommunityComponent } from '../AmityRecommenedCommunityComponent/AmityRecommenedCommunityComponent';
import { PageID } from '../../../enum';

type AmityExploreComponentProps = {
  pageId?: PageID;
};

const AmityExploreComponent: React.FC<AmityExploreComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <AmityRecommendedCommunityComponent pageId={pageId} />
    </View>
  );
};

export default AmityExploreComponent;
