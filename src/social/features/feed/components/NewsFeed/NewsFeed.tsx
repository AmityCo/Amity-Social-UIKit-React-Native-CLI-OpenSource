import { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../../enums/enumUIKitID';
import AmityGlobalFeedComponent from '../GlobalFeed/GlobalFeed';
import { useStyles } from './styles';
import Divider from '../../../../components/Divider';
import { useAmityComponent } from '../../../../hooks';

type AmityNewsFeedComponentType = {
  pageId?: PageID;
};

const AmityNewsFeedComponent: FC<AmityNewsFeedComponentType> = ({
  pageId = PageID.WildCardPage,
}) => {
  const componentId = ComponentID.newsfeed_component;
  const { accessibilityId, isExcluded } = useAmityComponent({
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
      <Divider />
      <AmityGlobalFeedComponent pageId={pageId} />
    </View>
  );
};

export default memo(AmityNewsFeedComponent);
