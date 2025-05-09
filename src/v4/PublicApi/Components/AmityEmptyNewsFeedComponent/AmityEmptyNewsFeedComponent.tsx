import { View } from 'react-native';
import React, { FC, memo } from 'react';
import { useStyles } from './styles';
import {
  Illustration,
  Title,
  Description,
  ExploreCommunityButton,
  CreateCommunityButton,
} from './Elements';
import Divider from '../../../component/Divider';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent } from '../../../hook';

type AmityEmptyNewsFeedComponentType = {
  pageId?: PageID;
  onPressExploreCommunity?: () => void;
};

const AmityEmptyNewsFeedComponent: FC<AmityEmptyNewsFeedComponentType> = ({
  onPressExploreCommunity,
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();
  const componentId = ComponentID.empty_newsfeed;

  const { themeStyles, accessibilityId, isExcluded } = useAmityComponent({
    pageId,
    componentId,
  });

  if (isExcluded) return null;

  return (
    <>
      <Divider themeStyles={themeStyles} />
      <View
        style={styles.container}
        testID={accessibilityId}
        accessibilityLabel={accessibilityId}
      >
        <Illustration />
        <Title />
        <Description />
        <ExploreCommunityButton
          onPressExploreCommunity={onPressExploreCommunity}
        />
        <CreateCommunityButton />
      </View>
    </>
  );
};

export default memo(AmityEmptyNewsFeedComponent);
