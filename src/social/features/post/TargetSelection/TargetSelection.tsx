import React from 'react';
import { PageID, AmityPostTargetSelectionPageType } from '../../../enums';
import { useBehaviour } from '../../../providers/BehaviourProvider';

import TargetSelectionPage, {
  FeedParams,
} from '../../../components/TargetSelectionPage/TargetSelectionPage';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { serializeCommunity } from '../../../utils';

const AmityPostTargetSelectionPage = ({
  postType,
}: {
  postType: AmityPostTargetSelectionPageType;
}) => {
  const { AmityPostTargetSelectionPageBehavior } = useBehaviour();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const onSelectFeed = ({
    targetId,
    targetName,
    targetType,
    community,
    postSetting,
    needApprovalOnPostCreation,
    isPublic,
  }: FeedParams) => {
    if (postType === AmityPostTargetSelectionPageType.post) {
      if (AmityPostTargetSelectionPageBehavior.goToPostComposerPage) {
        return AmityPostTargetSelectionPageBehavior.goToPostComposerPage({
          community: serializeCommunity(community),
          targetId,
          targetType,
        });
      }

      return navigation.navigate('CreatePost', {
        community: serializeCommunity(community),
        targetType,
        targetId,
      });
    }

    if (postType === AmityPostTargetSelectionPageType.poll) {
      if (AmityPostTargetSelectionPageBehavior.goToPollComposerPage) {
        return AmityPostTargetSelectionPageBehavior.goToPollComposerPage({
          targetId,
          targetType,
          targetName,
          postSetting,
          needApprovalOnPostCreation,
          isPublic,
        });
      }

      return navigation.navigate('CreatePoll', {
        targetId,
        targetType,
        targetName,
        postSetting,
        needApprovalOnPostCreation,
        isPublic,
      });
    }
  };

  const onClickClose = () => {
    if (AmityPostTargetSelectionPageBehavior?.onClickClose) {
      AmityPostTargetSelectionPageBehavior.onClickClose();
    }
  };

  return (
    <TargetSelectionPage
      pageId={PageID.select_post_target_page}
      onSelectFeed={onSelectFeed}
      onClickClose={onClickClose}
    />
  );
};

export default React.memo(AmityPostTargetSelectionPage);
