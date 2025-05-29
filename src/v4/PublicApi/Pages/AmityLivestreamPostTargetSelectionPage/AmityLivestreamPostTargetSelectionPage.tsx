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

  const onSelectFeed = ({ targetId, targetType }: FeedParams) => {
    if (
      AmityLivestreamPostTargetSelectionPageBehavior.goToLivestreamComposerPage
    ) {
      return AmityLivestreamPostTargetSelectionPageBehavior.goToLivestreamComposerPage(
        {
          targetId,
          targetType,
        }
      );
    }
    navigation.navigate('LivestreamPostTargetSelection');
  };

  return (
    <TargetSelectionPage
      onSelectFeed={onSelectFeed}
      pageId={PageID.livestream_post_target_selection_page}
    />
  );
};

export default React.memo(AmityLivestreamPostTargetSelectionPage);
