import { PageID } from '../../../enums';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TargetSelectionPage, {
  FeedParams,
} from '../../../components/TargetSelectionPage/TargetSelectionPage';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import React from 'react';

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
      AmityLivestreamPostTargetSelectionPageBehavior.goToCreateLivestreamPage
    ) {
      return AmityLivestreamPostTargetSelectionPageBehavior.goToCreateLivestreamPage(
        context
      );
    }
    navigation.navigate('CreateLivestream', context);
  };

  const onClickClose = () => {
    if (AmityLivestreamPostTargetSelectionPageBehavior?.onClickClose) {
      AmityLivestreamPostTargetSelectionPageBehavior.onClickClose();
    }
  };
  return (
    <TargetSelectionPage
      onSelectFeed={onSelectFeed}
      pageId={PageID.livestream_post_target_selection_page}
      onClickClose={onClickClose}
    />
  );
};

export default React.memo(AmityLivestreamPostTargetSelectionPage);
