import React, { useEffect } from 'react';
import { useStyles } from './styles';
import { Alert, FlatList, TouchableOpacity, View } from 'react-native';
import { Typography } from '~/v4/component/Typography/Typography';
import Avatar from '~/v4/component/Avatar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import Timestamp from '~/v4/elements/Timestamp';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import MenuButton from '~/v4/elements/MenuButton';
import useAuth from '~/hooks/useAuth';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import { firework, trash } from '~/v4/assets/icons';
import MenuAction from '~/v4/elements/MenuAction';
import PostContent from '~/v4/component/PostContent';
import FormDescription from '~/v4/elements/FormDescription';
import { usePostCollection } from '~/v4/hook/collections/usePostCollection';
import ActionButton from '~/v4/elements/ActionButton';
import { useIsCommunityModerator } from '~/v4/hook';
import { usePendingPostQuery } from '~/v4/hook/usePendingPostQuery';
import { SvgXml } from 'react-native-svg';
import { Title } from '~/v4/elements';
import PostFeedSkeleton from '~/v4/component/PostFeedSkeleton';

type PendingPostListProps = {
  community: Amity.Community;
  onPendingPostCountChange?: (count: number) => void;
};

const usePendingPostList = ({
  community,
  onPendingPostCountChange,
}: PendingPostListProps) => {
  const { styles, theme } = useStyles();
  const { client } = useAuth();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { deletePost, approvePost, declinePost } = usePendingPostQuery();

  const collection = usePostCollection({
    params: {
      targetType: 'community',
      targetId: community.communityId,
      feedType: 'reviewing',
      limit: 20,
    },
  });

  const { isCommunityModerator } = useIsCommunityModerator({
    communityId: community.communityId,
    userId: client.userId,
  });

  useEffect(() => {
    onPendingPostCountChange?.(collection.data.length);
  }, [collection.data.length, onPendingPostCountChange]);

  const handleDeletePost = (postId: string) => {
    closeBottomSheet();
    Alert.alert(
      'Delete this post?',
      "This post will be permanently deleted. You'll no longer to see and find this post.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePost(postId);
          },
        },
      ]
    );
  };

  const renderDivider = () => <View style={styles.separator} />;

  return {
    styles,
    theme,
    client,
    navigation,
    collection,
    declinePost,
    approvePost,
    renderDivider,
    openBottomSheet,
    handleDeletePost,
    isCommunityModerator,
  };
};

const PendingPostList = ({
  community,
  onPendingPostCountChange,
}: PendingPostListProps) => {
  const {
    client,
    styles,
    theme,
    navigation,
    collection,
    declinePost,
    approvePost,
    renderDivider,
    openBottomSheet,
    handleDeletePost,
    isCommunityModerator,
  } = usePendingPostList({ community, onPendingPostCountChange });

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <FormDescription
          pageId={PageID.pending_request_page}
          componentId={ComponentID.pending_post_list}
          elementId={ElementID.posts_tab_description}
        />
      </View>
      {collection.isLoading && <PostFeedSkeleton />}
      <FlatList
        data={collection.data}
        style={styles.scrollContainer}
        keyExtractor={(item) => item.postId}
        ItemSeparatorComponent={renderDivider}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pendingPostListContainer}
        ListFooterComponent={
          collection.isFetchingNextPage ? <PostFeedSkeleton /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <SvgXml
              width={60}
              height={60}
              xml={firework()}
              color={theme.colors.secondaryShade4}
            />
            <Title style={styles.emptyTitle}>No pending posts</Title>
          </View>
        }
        onEndReached={() => {
          if (collection.hasNextPage && !collection.isFetchingNextPage)
            collection.fetchNextPage?.();
        }}
        renderItem={({ item }) => (
          <View>
            <View style={styles.pendingPostContainer}>
              <View style={styles.pendingPostCreatorContainer}>
                <Avatar.User
                  userName={item?.creator?.displayName || item?.creator?.userId}
                  imageStyle={styles.pendingPostAvatar}
                  uri={item?.creator?.avatar?.fileUrl}
                  userId={item?.creator?.userId}
                  shouldRedirectToUserProfile
                />
                <View style={styles.userNameContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        userId: item?.creator?.userId,
                      })
                    }
                  >
                    <Typography.BodyBold
                      style={styles.colorBase}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item?.creator?.displayName || item?.creator?.userId}
                    </Typography.BodyBold>
                  </TouchableOpacity>
                  <Timestamp
                    timestamp={item?.createdAt}
                    pageId={PageID.pending_request_page}
                    componentId={ComponentID.pending_post_list}
                  />
                </View>
              </View>
              {client.userId === item?.creator?.userId && (
                <MenuButton
                  testID="pending-post-menu-button"
                  pageId={PageID.pending_request_page}
                  componentId={ComponentID.pending_post_list}
                  onPress={() => {
                    openBottomSheet({
                      height: 140,
                      content: (
                        <MenuAction
                          danger
                          label="Delete post"
                          onPress={() => handleDeletePost(item?.postId)}
                          iconProps={{ xml: trash() }}
                          testID="delete-pending-post-button"
                          accessibilityLabel="Delete pending post"
                        />
                      ),
                    });
                  }}
                />
              )}
            </View>
            <View style={styles.pendingPostContentContainer}>
              <PostContent
                post={item}
                disabledPoll
                showedAllOptions
                childrenPosts={item.children}
                textPost={(item.data as Amity.ContentDataText)?.text}
                mentionPositionArr={item?.metadata?.mentioned ?? []}
              />
            </View>
            {isCommunityModerator && (
              <>
                <View style={styles.divider} />
                <View style={styles.actionContainer}>
                  <ActionButton
                    fullWidth
                    pageId={PageID.pending_request_page}
                    onPress={() => approvePost(item.postId)}
                    componentId={ComponentID.pending_post_list}
                    elementId={ElementID.post_accept_button}
                  />
                  <ActionButton
                    fullWidth
                    type="secondary"
                    pageId={PageID.pending_request_page}
                    onPress={() => declinePost(item.postId)}
                    componentId={ComponentID.pending_post_list}
                    elementId={ElementID.post_decline_button}
                  />
                </View>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default PendingPostList;
