import { View, TouchableOpacity } from 'react-native';
import Avatar from '../../../../../components/Avatar';
import { BrandBadge } from '../../../../../elements/BrandBadge';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import ReadMore from '@fawazahmed/react-native-read-more';
import { useHeader } from './hooks/useHeader';
import { UserRelationshipTab } from '../../../../../types';
import Skeleton from '../../../../../../core/components/Skeleton/Skeleton';
import { useStyles } from './styles';
import {
  UnblockButton,
  FollowButton,
  FollowingButton,
  PendingButton,
  PendingFollowRequestsBanner,
} from '../../elements';
import MenuAction from '../../../../../elements/MenuAction';
import { Menu } from '../Menu';

type HeaderProps = {
  user?: Amity.User;
  inline?: boolean;
};

export function Header({ user, inline }: HeaderProps) {
  const {
    styles,
    showBadge,
    badgeSize,
    onTextLayout,
    badgePosition,
    followerCount,
    followingCount,
    navigateToRelationship,
    isMyProfile,
    isBlockedByMe,
    isFollowing,
    isPending,
    isFollowLoading,
    handleUnblock,
    handleFollow,
    handleUnfollow,
    followingActions,
    openBottomSheet,
    bottomSheetHeight,
    showPendingBanner,
    pendingFollowRequestCount,
    navigateToPendingFollowRequests,
  } = useHeader(user);

  return (
    <View>
      <View style={styles.userInfo}>
        <Avatar.User
          viewable
          userId={user?.userId}
          imageStyle={styles.image}
          userName={user?.displayName}
          uri={user?.avatarCustomUrl ?? user?.avatar?.fileUrl}
        />
        <View style={styles.displayNameContainer}>
          <Typography.Headline numberOfLines={4} onTextLayout={onTextLayout}>
            {user?.displayName ?? user?.userId}
          </Typography.Headline>
          {showBadge && badgePosition && (
            <View style={styles.badge}>
              <BrandBadge width={badgeSize} height={badgeSize} />
            </View>
          )}
        </View>
        {inline && (
          <Menu userId={user?.userId} displayName={user?.displayName} />
        )}
      </View>
      {!!user?.description && (
        <View style={styles.descriptionContainer}>
          <ReadMore
            seeLessText=""
            numberOfLines={4}
            style={styles.description}
            seeMoreStyle={styles.seeMore}
            seeLessStyle={styles.description}
          >
            {user.description}
          </ReadMore>
        </View>
      )}
      <View style={styles.followInfoContainer}>
        <TouchableOpacity
          onPress={() => navigateToRelationship(UserRelationshipTab.following)}
        >
          <Typography.BodyBold>
            {followingCount}
            <Typography.Caption style={styles.followInfoLabel}>
              {' '}
              following
            </Typography.Caption>
          </Typography.BodyBold>
        </TouchableOpacity>
        <View style={styles.followInfoDivider} />
        <TouchableOpacity
          onPress={() => navigateToRelationship(UserRelationshipTab.follower)}
        >
          <Typography.BodyBold>
            {followerCount}
            <Typography.Caption style={styles.followInfoLabel}>
              {' '}
              followers
            </Typography.Caption>
          </Typography.BodyBold>
        </TouchableOpacity>
      </View>
      {isBlockedByMe ? (
        <View style={styles.buttonContainer}>
          <UnblockButton onPress={handleUnblock} />
        </View>
      ) : (
        !isMyProfile && (
          <View style={styles.buttonContainer}>
            {isPending ? (
              <PendingButton
                onPress={handleUnfollow}
                disabled={isFollowLoading}
              />
            ) : isFollowing ? (
              <FollowingButton
                disabled={isFollowLoading}
                onPress={() =>
                  openBottomSheet({
                    height: bottomSheetHeight[followingActions.length],
                    content: (
                      <View>
                        {followingActions.map((action) => (
                          <MenuAction
                            gap="small"
                            key={action.label}
                            {...action}
                          />
                        ))}
                      </View>
                    ),
                  })
                }
              />
            ) : (
              <FollowButton onPress={handleFollow} disabled={isFollowLoading} />
            )}
          </View>
        )
      )}
      {showPendingBanner && (
        <View style={styles.buttonContainer}>
          <PendingFollowRequestsBanner
            count={pendingFollowRequestCount}
            onPress={navigateToPendingFollowRequests}
          />
        </View>
      )}
    </View>
  );
}

export function HeaderSkeleton() {
  const { styles } = useStyles();

  return (
    <Skeleton>
      <Skeleton style={styles.userInfo}>
        <Skeleton.Circle width={56} height={56} />
        <Skeleton.Line width={200} height={12} />
      </Skeleton>

      <Skeleton style={styles.descriptionContainer}>
        <Skeleton.Line width={240} height={8} bottom={12} />
        <Skeleton.Line width={300} height={8} bottom={12} />
      </Skeleton>

      <Skeleton style={styles.followInfoContainer}>
        <Skeleton.Line width={54} height={12} />
        <Skeleton.Line width={54} height={12} />
      </Skeleton>
    </Skeleton>
  );
}

Header.Skeleton = HeaderSkeleton;
