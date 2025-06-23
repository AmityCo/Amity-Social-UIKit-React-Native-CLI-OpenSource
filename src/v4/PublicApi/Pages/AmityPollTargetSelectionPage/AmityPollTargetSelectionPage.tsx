import React from 'react';
import { PageID } from '../../../enum';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TargetSelectionPage, {
  FeedParams,
} from '../../../component/TargetSelectionPage/TargetSelectionPage';
import { RootStackParamList } from '../../../routes/RouteParamList';

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
    const context = {
      pop: 2,
      targetId,
      targetType,
      targetName:
        targetType === 'community' ? community?.displayName : targetName,
    };

    if (AmityPollTargetSelectionPageBehavior.goToPollPostComposerPage) {
      return AmityPollTargetSelectionPageBehavior.goToPollPostComposerPage(
        context
      );
    }
    navigation.navigate('CreateLivestream', context);
  };

  return (
    <TargetSelectionPage
      onSelectFeed={onSelectFeed}
      pageId={PageID.select_poll_target_page}
    />
  );
};

export default React.memo(AmityPollTargetSelectionPage);
