import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal } from 'react-native';
import { useStyles } from './styles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAuth from '~/hooks/useAuth';
import { SvgXml } from 'react-native-svg';
import { primaryDot } from '~/v4/../svg/svg-xml-list';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
import FloatingButton from '~/v4/../components/FloatingButton';
import { useDispatch } from 'react-redux';
import uiSlice from '~/redux/slices/uiSlice';
import { PostTargetType } from '~/v4/../enum/postTargetType';
import Avatar from '~/v4/component/Avatar';
import { Typography } from '~/v4/component/Typography/Typography';
import { useFollowUserStatus } from '~/v4/hook/useFollowUserStatus';
import { useUser } from '~/v4/hook/useUser';
import { verifiedBadge } from '~/v4/assets/icons';
import { useUserBlock } from '~/v4/hook/useUserBlock';
import FollowButton from '../FollowButton/FollowButton';
import { useSocialSettings } from '~/v4/hook/useSocialSettings';
import ImageViewer from '~/v4/elements/ImageViewer/ImageViewer';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { useAmityComponent } from '~/v4/hook/useUiKitReference';
import { UserName } from '~/v4/elements/UserName';
import { UserDescription } from '~/v4/elements/UserDescription';
import { UserFollow } from '~/v4/elements/UserFollow/';

type UserProfilePageProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  userId: string;
};

function Info({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  userId,
}: UserProfilePageProps) {
  const { accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();
  const { client } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { openPostTypeChoiceModal } = uiSlice.actions;
  const dispatch = useDispatch();
  const { socialSettings } = useSocialSettings();

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

  const [openImageViewer, setOpenImageViewer] = useState(false);

  const isMyProfile = !followStatus;
  const isAccepted = followStatus === 'accepted';
  const shouldShowPending = isMyProfile && pendingCount > 0;

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
          <Typography.BodyBold style={styles.pendingRequestText}>
            New follow requests
          </Typography.BodyBold>
        </View>

        <Typography.Caption style={styles.pendingRequestSubText}>
          {pendingCount} requests need your approval
        </Typography.Caption>
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

  const onPressFollowers = useCallback(() => {
    if (isMyProfile || isAccepted) navigation.navigate('FollowerList', user);
  }, [isAccepted, isMyProfile, navigation, user]);

  return (
    <View testID={accessibilityId} style={styles.profileContainer}>
      <View style={styles.userDetail}>
        <Avatar.User
          pageId={pageId}
          componentId={componentId}
          elementId={ElementID.user_avatar}
          uri={user?.avatar?.fileUrl}
          imageStyle={styles.avatar}
          userName={user?.displayName || user?.userId}
          onOpenImageViewer={() => setOpenImageViewer(true)}
        />
        <UserName
          pageId={pageId}
          componentId={componentId}
          name={user?.displayName || user?.userId}
        />

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
          <UserDescription
            pageId={pageId}
            componentId={componentId}
            description={user?.description}
          />
        </View>
      ) : null}

      <View style={styles.userInfo}>
        <Pressable style={styles.horizontalText} onPress={onPressFollowers}>
          <UserFollow
            pageId={pageId}
            componentId={componentId}
            count={followingCount}
            elementId={ElementID.user_following}
          />
          <Text style={styles.textDivider}> | </Text>
          <UserFollow
            pageId={pageId}
            componentId={componentId}
            count={followerCount}
            elementId={ElementID.user_follower}
          />
        </Pressable>
      </View>
      <FollowButton
        pageId={pageId}
        componentId={componentId}
        userId={userId}
        followStatus={followStatus}
        userName={user?.displayName}
        followUser={followUser}
        unfollowUser={unfollowUser}
        unblockUser={unblockUser}
        socialSettings={socialSettings?.userPrivacySetting}
      />
      {shouldShowPending && pendingCountButton()}
      {(client as Amity.Client).userId === userId && (
        <FloatingButton onPress={handleOnPressPostBtn} isGlobalFeed={false} />
      )}
      {openImageViewer && user?.avatar?.fileUrl && (
        <Modal
          visible={openImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setOpenImageViewer(false)}
        >
          <ImageViewer
            images={[user.avatar.fileUrl]}
            currentImageIndex={0}
            themeStyles={theme}
            onNextImage={() => {}}
            onPreviousImage={() => {}}
            onClose={() => {
              setOpenImageViewer(false);
            }}
            isShowCounter={false}
          />
        </Modal>
      )}
    </View>
  );
}

export default Info;
