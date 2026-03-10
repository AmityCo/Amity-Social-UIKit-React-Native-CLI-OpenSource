import { TouchableOpacity, View } from 'react-native';
import { BrandBadge } from '../../../../../elements/BrandBadge';
import { useStyles } from './styles';
import Avatar from '../../../../../components/Avatar';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import Skeleton from '../../../../../../core/components/Skeleton/Skeleton';
import { useBlockUser } from '../../../../../hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import { useBehaviour } from '../../../../../providers/BehaviourProvider';
import { UnblockUserButton } from '../../elements';

type UserItemProps = {
  user: Amity.User;
};

export function UserItem({ user }: UserItemProps) {
  const { styles } = useStyles();
  const { unBlockUser } = useBlockUser();
  const { AmityBlockedUsersPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleUnblock = () => {
    unBlockUser(user.userId, user.displayName);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View ${user.displayName}'s profile`}
      style={styles.container}
      onPress={() => {
        if (AmityBlockedUsersPageBehavior?.goToUserProfilePage) {
          AmityBlockedUsersPageBehavior.goToUserProfilePage({
            userId: user.userId,
          });
        } else {
          navigation.navigate('UserProfile', { userId: user.userId });
        }
      }}
    >
      <Avatar.User
        userId={user.userId}
        imageStyle={styles.avatar}
        userName={user.displayName}
        uri={user.avatarCustomUrl ?? user.avatar?.fileUrl}
      />
      <View style={styles.nameContainer}>
        <Typography.BodyBold
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.displayName}
        >
          {user.displayName}
        </Typography.BodyBold>
        {user.isBrand && (
          <BrandBadge
            accessible
            accessibilityLabel="Brand verified"
            width={16}
            height={16}
          />
        )}
      </View>
      <UnblockUserButton
        accessibilityLabel={`Unblock ${user.displayName}`}
        onPress={handleUnblock}
      />
    </TouchableOpacity>
  );
}

function UserItemSkeleton() {
  const { styles } = useStyles();

  return (
    <Skeleton style={styles.container}>
      <Skeleton.Circle width={40} height={40} />
      <Skeleton.Line width={140} height={10} />
    </Skeleton>
  );
}

UserItem.Skeleton = UserItemSkeleton;
