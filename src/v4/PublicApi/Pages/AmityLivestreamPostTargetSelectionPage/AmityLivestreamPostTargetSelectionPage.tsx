import React from 'react';
import { PageID } from '../../../../v4/enum';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TargetSelectionPage, {
  FeedParams,
} from '../../../component/TargetSelectionPage/TargetSelectionPage';
import { RootStackParamList } from '../../../routes/RouteParamList';

const AmityLivestreamPostTargetSelectionPage = () => {
  const { AmityLivestreamPostTargetSelectionPageBehavior } = useBehaviour();
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

    if (
      AmityLivestreamPostTargetSelectionPageBehavior.goToLivestreamComposerPage
    ) {
      return AmityLivestreamPostTargetSelectionPageBehavior.goToLivestreamComposerPage(
        context
      );
    }
    navigation.navigate('CreateLivestream', context);
  };

  return (
    <TargetSelectionPage
      onSelectFeed={onSelectFeed}
      pageId={PageID.livestream_post_target_selection_page}
    />
  );
};

export default React.memo(AmityLivestreamPostTargetSelectionPage);
