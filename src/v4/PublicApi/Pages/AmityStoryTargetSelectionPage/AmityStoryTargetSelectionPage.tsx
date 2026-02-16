import React from 'react';
import { PageID } from '../../../../social/enums';
import { useBehaviour } from '../../../../social/providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TargetSelectionPage, {
  FeedParams,
} from '../../../../social/components/TargetSelectionPage/TargetSelectionPage';

const AmityStoryTargetSelectionPage = () => {
  const { AmityStoryTargetSelectionPageBehavior } = useBehaviour();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const onSelectFeed = ({ targetId, targetType }: FeedParams) => {
    if (AmityStoryTargetSelectionPageBehavior.goToStoryComposerPage) {
      return AmityStoryTargetSelectionPageBehavior.goToStoryComposerPage({
        targetId,
        targetType,
      });
    }
    navigation.navigate('CreateStory', {
      targetId,
      targetType,
    });
  };

  const onClickClose = () => {
    if (AmityStoryTargetSelectionPageBehavior?.onClickClose) {
      AmityStoryTargetSelectionPageBehavior.onClickClose();
    }
  };

  return (
    <TargetSelectionPage
      pageId={PageID.select_story_target_page}
      onSelectFeed={onSelectFeed}
      hideMyTimelineTarget={true}
      onClickClose={onClickClose}
    />
  );
};

export default React.memo(AmityStoryTargetSelectionPage);
