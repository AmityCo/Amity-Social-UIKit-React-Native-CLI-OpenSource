import { TouchableOpacity, View } from 'react-native';
import Avatar from '../../../../../components/Avatar';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { BrandBadge } from '../../../../../elements/BrandBadge';
import { Button, BUTTON_SIZE } from '../../../../../components';
import Skeleton from '../../../../../../core/components/Skeleton/Skeleton';
import { useUser } from '../../../../../hooks/objects';
import { usePendingFollowRequest } from '../../../../../hooks/queries/usePendingFollowRequest';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import { useBehaviour } from '../../../../../providers/BehaviourProvider';
import { useStyles } from './styles';

type RequestItemProps = {
  userId: string;
};

export function RequestItem({ userId }: RequestItemProps) {
  const { styles } = useStyles();
  const { user } = useUser({ userId });
  const { acceptRequest, declineRequest, isLoading } =
    usePendingFollowRequest();
  const { AmityUserPendingFollowRequestsPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePressUser = () => {
    if (AmityUserPendingFollowRequestsPageBehavior?.goToUserProfilePage) {
      AmityUserPendingFollowRequestsPageBehavior.goToUserProfilePage({
        userId,
      });
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.userContainer}
        onPress={handlePressUser}
      >
        <Avatar.User
          userId={userId}
          imageStyle={styles.avatar}
          userName={user?.displayName}
          uri={user?.avatarCustomUrl ?? user?.avatar?.fileUrl}
        />
        <View style={styles.nameContainer}>
          <Typography.BodyBold
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.displayName}
          >
            {user?.displayName}
          </Typography.BodyBold>
          {user?.isBrand && (
            <BrandBadge
              accessible
              accessibilityLabel="Brand verified"
              width={16}
              height={16}
            />
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.buttonsContainer}>
        <Button
          type="primary"
          disabled={isLoading}
          style={styles.button}
          size={BUTTON_SIZE.LARGE}
          onPress={() => acceptRequest(userId, user?.displayName ?? userId)}
        >
          Accept
        </Button>
        <Button
          type="secondary"
          disabled={isLoading}
          style={styles.button}
          size={BUTTON_SIZE.LARGE}
          onPress={() => declineRequest(userId)}
        >
          Decline
        </Button>
      </View>
    </View>
  );
}

function RequestItemSkeleton() {
  const { styles } = useStyles();

  return (
    <Skeleton style={styles.container}>
      <Skeleton style={styles.skeletonContainer}>
        <Skeleton.Circle width={40} height={40} />
        <Skeleton.Line width={140} height={10} />
      </Skeleton>
    </Skeleton>
  );
}

RequestItem.Skeleton = RequestItemSkeleton;
