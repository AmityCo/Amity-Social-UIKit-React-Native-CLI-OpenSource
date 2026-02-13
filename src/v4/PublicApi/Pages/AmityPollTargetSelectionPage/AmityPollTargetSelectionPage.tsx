import React from 'react';
import { PageID } from '../../../enums';
import { useBehaviour } from '../../../../social/providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TargetSelectionPage, {
  FeedParams,
} from '../../../component/TargetSelectionPage/TargetSelectionPage';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';

const AmityPollTargetSelectionPage = () => {
  const { AmityPollTargetSelectionPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onSelectFeed = ({
    targetId,
    targetType,
    targetName,
    community,
  }: FeedParams) => {
    const context = { pop: 2, targetId, targetType, community, targetName };

    if (AmityPollTargetSelectionPageBehavior.goToPollPostComposerPage) {
      return AmityPollTargetSelectionPageBehavior.goToPollPostComposerPage(
        context
      );
    }
    navigation.navigate('PollPostComposer', context);
  };
  const onClickClose = () => {
    if (AmityPollTargetSelectionPageBehavior?.onClickClose) {
      AmityPollTargetSelectionPageBehavior.onClickClose();
    }
  };
  return (
    <TargetSelectionPage
      onSelectFeed={onSelectFeed}
      pageId={PageID.select_poll_target_page}
      onClickClose={onClickClose}
    />
  );
};

export default React.memo(AmityPollTargetSelectionPage);
