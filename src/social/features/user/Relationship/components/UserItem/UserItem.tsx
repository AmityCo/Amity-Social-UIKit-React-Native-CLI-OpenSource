import { View, TouchableOpacity } from 'react-native';
import { useStyles } from './styles';
import Avatar from '../../../../../components/Avatar';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import MenuButton from '../../../../../elements/MenuButton';
import Skeleton from '../../../../../../core/components/Skeleton/Skeleton';
import MenuAction from '../../../../../elements/MenuAction';
import { useUserItem } from './hooks/useUserItem';
import { BrandBadge } from '../../../../../elements/BrandBadge';

export type UserItemProps = {
  profileId: string;
  userId: string;
};

export function UserItem({ profileId, userId }: UserItemProps) {
  const {
    user,
    styles,
    actions,
    isMyItem,
    openBottomSheet,
    bottomSheetHeight,
    goToUserProfile,
  } = useUserItem({
    userId,
    profileId,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View ${user?.displayName}'s profile`}
      style={styles.container}
      onPress={goToUserProfile}
    >
      <Avatar.User
        shouldRedirectToUserProfile
        userId={user?.userId}
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
      {!isMyItem && (
        <MenuButton
          accessibilityLabel={`More options for ${user?.displayName}`}
          onPress={() => {
            openBottomSheet({
              height: bottomSheetHeight[actions.length],
              content: (
                <View>
                  {actions.map((action) => (
                    <MenuAction gap="small" {...action} key={action.label} />
                  ))}
                </View>
              ),
            });
          }}
        />
      )}
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
