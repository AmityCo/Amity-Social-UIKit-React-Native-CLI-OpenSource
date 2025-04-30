import { View } from 'react-native';
import React, { memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage } from '../../../hook';
import AmityCommunityHeaderComponent from '../../Components/AmityCommunityHeaderComponent/AmityCommunityHeaderComponent';
import { AmityStoryTabComponentEnum } from '../../types';
import AmityStoryTabComponent from '../../Components/AmityStoryTabComponent/AmityStoryTabComponent';

const AmityCommunitieProfilePage = ({ route }: any) => {
  const pageId = PageID.community_profile_page;
  const { communityId } = route.params;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const styles = useStyles(themeStyles);

  return (
    <View
      testID={accessibilityId}
      style={styles.container}
      accessibilityLabel={accessibilityId}
    >
      <AmityCommunityHeaderComponent
        pageId={pageId}
        communityId={communityId}
      />
      <AmityStoryTabComponent
        type={AmityStoryTabComponentEnum.communityFeed}
        targetId={communityId}
      />
    </View>
  );
};

export default memo(AmityCommunitieProfilePage);
