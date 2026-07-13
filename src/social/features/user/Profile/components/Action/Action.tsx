import { PostTargetType } from '../../../../../enums/postTargetType';
import { poll, post } from '../../../../../../core/assets/icons';
import { useBottomSheet } from '../../../../../../core/stores/slices/bottomSheetSlice';
import { FloatingActionButton } from '../../../../../components';
import MenuAction from '../../../../../elements/MenuAction';
import { useBehaviour } from '../../../../../providers/BehaviourProvider';
import { AmityPostComposerMode } from '../../../../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import useAuth from '../../../../../../core/hooks/useAuth';

type ActionProps = {
  userId: string;
};

export function Action({ userId }: ActionProps) {
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { AmityUserProfilePageBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { client } = useAuth();

  if (client?.userId !== userId) return null;

  return (
    <FloatingActionButton
      onPress={() => {
        openBottomSheet({
          height: 240,
          content: (
            <>
              <MenuAction
                gap="small"
                label="Post"
                iconProps={{
                  xml: post(),
                }}
                onPress={() => {
                  closeBottomSheet();
                  if (AmityUserProfilePageBehavior?.goToPostComposerPage) {
                    AmityUserProfilePageBehavior?.goToPostComposerPage?.({
                      mode: AmityPostComposerMode.CREATE,
                      targetId: userId,
                      targetType: PostTargetType.user,
                    });
                  } else {
                    navigation.navigate('CreatePost', {
                      mode: AmityPostComposerMode.CREATE,
                      targetId: userId,
                      targetType: PostTargetType.user,
                    });
                  }
                }}
              />
              <MenuAction
                gap="small"
                label="Poll"
                iconProps={{
                  xml: poll(),
                }}
                onPress={() => {
                  closeBottomSheet();
                  if (AmityUserProfilePageBehavior?.goToPollPostComposerPage) {
                    AmityUserProfilePageBehavior?.goToPollPostComposerPage?.({
                      targetId: userId,
                      targetType: 'user',
                    });
                  } else {
                    navigation.navigate('PollPostComposer', {
                      targetId: userId,
                      targetType: PostTargetType.user,
                    });
                  }
                }}
              />
            </>
          ),
        });
      }}
    />
  );
}
