import React, {
  useState,
  useEffect,
  useRef,
  type MutableRefObject,
  // useLayoutEffect,
  useCallback,
} from 'react';
import { View, Text, TouchableOpacity, Image, Pressable } from 'react-native';
import { useStyles } from './styles';
import Feed from '~/v4/screen/Feed';
import CustomTab from '~/components/CustomTab';
import type { FeedRefType } from '~/v4/screen/CommunityHome';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAuth from '~/hooks/useAuth';
import { SvgXml } from 'react-native-svg';
import {
  blockOrUnblock,
  cancelFollowRequest,
  primaryDot,
  privateUserProfile,
} from '~/v4/../svg/svg-xml-list';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
import FloatingButton from '~/v4/../components/FloatingButton';
import { TabName } from '~/v4/../enum/tabNameState';
import { useDispatch } from 'react-redux';
import uiSlice from '~/redux/slices/uiSlice';
import { PostTargetType } from '~/v4/../enum/postTargetType';
import GalleryComponent from '~/v4/component/Gallery/GalleryComponent';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import Avatar from '~/v4/component/Avatar';
import { Typography } from '~/v4/component/Typography/Typography';
import { useFollowUserStatus } from '~/v4/hook/useFollowUserStatus';
import { useUser } from '~/v4/hook/useUser';
import { verifiedBadge, following as followingIcon } from '~/v4/assets/icons';
import { useUserBlock } from '~/v4/hook/useUserBlock';

type UserProfilePageProps = RootStackParamList['UserProfile'];

// copy all code and separate it following the new floder structure

function Info({ userId }: UserProfilePageProps) {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();
  const { client } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { openPostTypeChoiceModal } = uiSlice.actions;
  const dispatch = useDispatch();

  const {
    followingCount,
    followerCount,
    pendingCount,
    followStatus,
    unfollowUser,
    followUser,
  } = useFollowUserStatus({ userId });

  const { unblockUser } = useUserBlock(userId);

  const user = useUser(userId);

  const [currentTab, setCurrentTab] = useState<TabName>(TabName.Timeline);
  const [socialSettings, setSocialSettings] =
    useState<Amity.SocialSettings>(null);

  const isMyProfile = !followStatus;
  const isBlocked = followStatus === 'blocked';
  const isUnfollowed = followStatus === 'none';
  const isPending = followStatus === 'pending';
  const isAccepted = followStatus === 'accepted';
  const shouldShowPrivateProfile =
    !isMyProfile &&
    !isAccepted &&
    socialSettings?.userPrivacySetting === 'private';
  const shouldShowPending = isMyProfile && pendingCount > 0;
  const feedRef: MutableRefObject<FeedRefType | null> =
    useRef<FeedRefType | null>(null);
  const galleryRef: MutableRefObject<FeedRefType | null> =
    useRef<FeedRefType | null>(null);

  useEffect(() => {
    (async () => {
      if (client) {
        const settings = await (client as Amity.Client)?.getSocialSettings();
        setSocialSettings(settings);
      }
    })();
  }, [client]);

  const followButton = () => {
    return (
      <TouchableOpacity
        style={styles.followButton}
        onPress={() => unfollowUser(userId)}
      >
        <Image
          source={require('~/v4/assets/images/followPlus.png')}
          style={styles.followIcon}
        />
        <Typography.BodyBold style={styles.followText}>
          Follow
        </Typography.BodyBold>
      </TouchableOpacity>
    );
  };

  const followingButton = () => {
    return (
      <TouchableOpacity
        style={styles.followingButton}
        onPress={() => followUser(userId)}
      >
        <SvgXml
          width={20}
          height={20}
          xml={followingIcon()}
          color={theme.colors.secondary}
        />
        <Typography.BodyBold style={styles.followingText}>
          Following
        </Typography.BodyBold>
      </TouchableOpacity>
    );
  };

  const unBlockButton = () => {
    return (
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => unblockUser(user?.displayName)}
      >
        <SvgXml
          width={24}
          height={20}
          xml={blockOrUnblock(theme.colors.base)}
        />
        <Text style={styles.editProfileText}>Unblock user</Text>
      </TouchableOpacity>
    );
  };

  const cancelRequestButton = () => {
    return (
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => unfollowUser(userId)}
      >
        <SvgXml
          width={24}
          height={20}
          xml={cancelFollowRequest(theme.colors.base)}
        />
        <Text style={styles.editProfileText}>Cancel request</Text>
      </TouchableOpacity>
    );
  };

  const pendingCountButton = () => {
    const onPressPending = () => {
      navigation.navigate('UserPendingRequest');
    };

    return (
      <TouchableOpacity
        style={styles.pendingRequestContainer}
        onPress={onPressPending}
      >
        <View style={styles.rowContainer}>
          <SvgXml xml={primaryDot(theme.colors.primary)} />
          <Text style={styles.pendingRequestText}>Pending requests</Text>
        </View>

        <Text style={styles.pendingRequestSubText}>
          Your requests are waiting for review
        </Text>
      </TouchableOpacity>
    );
  };

  const handleOnPressPostBtn = () => {
    dispatch(
      openPostTypeChoiceModal({
        userId: userId,
        targetId: userId,
        targetName: 'My Timeline',
        targetType: PostTargetType.user,
      })
    );
  };

  const renderButtons = () => {
    // if (isMyProfile) return editProfileButton();
    if (isUnfollowed) return followButton();
    if (isPending) return cancelRequestButton();
    if (isBlocked) return unBlockButton();
    if (isAccepted) return followingButton();
  };

  const renderPrivateProfile = () => {
    return (
      <View style={styles.privateProfileContainer}>
        <SvgXml width={40} height={40} xml={privateUserProfile()} />
        <Text style={styles.privateAccountTitle}>This account is private</Text>
        <Text style={styles.privateAccountSubTitle}>
          Follow this user to see all posts
        </Text>
      </View>
    );
  };

  const renderTabs = () => {
    if (shouldShowPrivateProfile) return renderPrivateProfile();
    if (currentTab === TabName.Timeline)
      return <Feed targetType="user" targetId={userId} ref={feedRef} />;
    if (currentTab === TabName.Gallery)
      return (
        <GalleryComponent
          targetId={userId}
          ref={galleryRef}
          targetType="user"
        />
      );
    return null;
  };

  const onPressFollowers = useCallback(() => {
    if (isMyProfile || isAccepted) navigation.navigate('FollowerList', user);
  }, [isAccepted, isMyProfile, navigation, user]);

  return (
    <View style={styles.profileContainer}>
      <View style={styles.userDetail}>
        <Avatar.User
          uri={user?.avatar?.fileUrl}
          imageStyle={styles.avatar}
          userName={user?.displayName || user?.userId}
        />
        <Typography.BodyBold style={styles.title}>
          {user?.displayName}
        </Typography.BodyBold>
        {user?.isBrand && (
          <View style={styles.verifyIcon}>
            <SvgXml
              width={20}
              height={20}
              xml={verifiedBadge()}
              color={theme.colors.secondaryShade4}
            />
          </View>
        )}
      </View>

      {user?.description ? (
        <View style={styles.descriptionContainer}>
          <Typography.Body style={styles.descriptionText}>
            {' '}
            {user?.description}
          </Typography.Body>
        </View>
      ) : null}

      <View style={styles.userInfo}>
        <Pressable style={styles.horizontalText} onPress={onPressFollowers}>
          <Typography.Body style={styles.amountTextComponent}>
            {followingCount}
          </Typography.Body>
          <Typography.Caption style={styles.textComponent}>
            {' '}
            following
          </Typography.Caption>
          <Text style={styles.textDivider}> | </Text>
          <Typography.Body style={styles.amountTextComponent}>
            {followerCount}
          </Typography.Body>
          <Typography.Caption style={styles.textComponent}>
            {' '}
            followers
          </Typography.Caption>
        </Pressable>
      </View>
      {renderButtons()}
      {shouldShowPending && pendingCountButton()}
      {!isBlocked && (
        <>
          <CustomTab
            tabName={[TabName.Timeline, TabName.Gallery]}
            onTabChange={setCurrentTab}
          />
          {renderTabs()}
        </>
      )}
      {(client as Amity.Client).userId === userId && (
        <FloatingButton onPress={handleOnPressPostBtn} isGlobalFeed={false} />
      )}
    </View>
  );
}

export default Info;
