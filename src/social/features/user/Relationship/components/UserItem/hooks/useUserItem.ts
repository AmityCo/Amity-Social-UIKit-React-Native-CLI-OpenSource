import { useBottomSheet } from '../../../../../../../core/stores/slices/bottomSheetSlice';
import { useUserFlaggedByMeQuery, useBlockUser } from '../../../../../../hooks';
import {
  report,
  unreport,
  block,
} from '../../../../../../../core/assets/icons';
import { useStyles } from '../styles';
import { useUser } from '../../../../../../hooks/objects';
import { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../../../../../../core/hooks/useAuth';
import { UserItemProps } from '../UserItem';
import { useBehaviour } from '../../../../../../providers/BehaviourProvider';

export function useUserItem({ profileId, userId }: UserItemProps) {
  const { styles } = useStyles();
  const { user } = useUser({ userId });
  const { client } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { open, openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const { isFlaggedByMe, reportUser, unreportUser } = useUserFlaggedByMeQuery({
    userId,
    enabled: open,
  });
  const { blockUser } = useBlockUser();
  const { AmityUserRelationshipPageBehavior } = useBehaviour();
  const isMyProfile = client?.userId === profileId;
  const isMyItem = client?.userId === userId;

  const goToUserProfile = () => {
    if (AmityUserRelationshipPageBehavior?.goToUserProfilePage) {
      AmityUserRelationshipPageBehavior.goToUserProfilePage({ userId });
    } else {
      navigation.push('UserProfile', { userId });
    }
  };

  const actions = [
    {
      visible: !isFlaggedByMe,
      label: 'Report user',
      iconProps: { xml: report() },
      onPress: () => {
        closeBottomSheet();
        reportUser(userId);
      },
    },
    {
      visible: !!isFlaggedByMe,
      label: 'Unreport user',
      iconProps: { xml: unreport() },
      onPress: () => {
        closeBottomSheet();
        unreportUser(userId);
      },
    },
    {
      visible: isMyProfile,
      label: 'Block user',
      iconProps: { xml: block() },
      onPress: () => {
        closeBottomSheet();
        blockUser(userId, user?.displayName || user?.userId || '');
      },
    },
  ].filter((action) => action.visible);

  return {
    actions,
    openBottomSheet,
    bottomSheetHeight,
    styles,
    user,
    navigation,
    isMyProfile,
    isMyItem,
    goToUserProfile,
  };
}
