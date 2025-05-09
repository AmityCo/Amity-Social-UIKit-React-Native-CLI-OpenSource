import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum/enumUIKitID';
import AmityGlobalFeedComponent from '../AmityGlobalFeedComponent/AmityGlobalFeedComponent';
import { useStyles } from './styles';
import Divider from '../../../component/Divider';
import { useAmityComponent } from '../../../hook';

type AmityNewsFeedComponentType = {
  pageId?: PageID;
};

const AmityNewsFeedComponent: FC<AmityNewsFeedComponentType> = ({
  pageId = PageID.WildCardPage,
}) => {
  const componentId = ComponentID.newsfeed_component;
  const { themeStyles, accessibilityId, isExcluded } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = useStyles();
  if (isExcluded) return null;

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <Divider themeStyles={themeStyles} />
      <AmityGlobalFeedComponent pageId={pageId} />
    </View>
  );
};

export default memo(AmityNewsFeedComponent);
