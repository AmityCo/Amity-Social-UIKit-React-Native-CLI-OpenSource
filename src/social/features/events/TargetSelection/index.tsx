import { memo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TargetSelectionPage from '../../../components/TargetSelectionPage/TargetSelectionPage';
import type { FeedParams } from '../../../components/TargetSelectionPage/TargetSelectionPage';
import { PageID } from '../../../enums';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

/**
 * Web parity: EventTargetSelection — pick the community an event is created
 * in ("Create event in"), then continue to the event setup form. My Timeline
 * is hidden because events always live in a community.
 */
const AmityEventTargetSelectionPage = () => {
  const pageId = PageID.select_event_target_page;
  const { AmityEventTargetSelectionPageBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onSelectFeed = useCallback(
    ({ targetId, targetName }: FeedParams) => {
      if (AmityEventTargetSelectionPageBehaviour?.goToEventSetupPage) {
        return AmityEventTargetSelectionPageBehaviour.goToEventSetupPage({
          mode: 'create',
          targetId,
          targetName,
        });
      }
      navigation.navigate('EventSetup', {
        mode: 'create',
        targetId,
        targetName,
      });
    },
    [AmityEventTargetSelectionPageBehaviour, navigation]
  );

  return (
    <TargetSelectionPage
      pageId={pageId}
      hideMyTimelineTarget
      onSelectFeed={onSelectFeed}
    />
  );
};

export default memo(AmityEventTargetSelectionPage);
