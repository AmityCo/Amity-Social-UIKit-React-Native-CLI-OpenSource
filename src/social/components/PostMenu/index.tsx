import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { getCommunityById } from '../../../core/legacy/community';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFlagPost, isModerator, useGlobalBehavior } from '../../hooks';
import { deletePostById } from '../../../core/legacy/feed';
import useAuth from '../../../core/hooks/useAuth';
import globalFeedSlice from '../../../core/stores/slices/globalfeedSlice';
import { pen, poll, report, trash, unreport } from '../../../core/assets/icons';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { ComponentID, PageID } from '../../enums';
import { useClosePoll } from '../../hooks/queries/useClosePoll';
import { useUIKitDispatch } from '../../../core/stores/store';
import MenuButton from '../../elements/MenuButton/MenuButton';
import MenuAction from '../../elements/MenuAction/MenuAction';
import { useBottomSheet } from '../../../core/stores/slices/bottomSheetSlice';
import { useUser } from '../../hooks/useUser';
import { isAdmin } from '../../utils/permissions';
import { usePostShareAction } from '../../features/post/components/EngagementActions/Components/usePostShareAction';
import { CopyLinkAction } from '../../elements/CopyLinkAction';
import { ShareAction } from '../../elements/ShareAction';

type PostMenuProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  post: Amity.Post<any>;
};

export function PostMenu({ pageId, componentId, post }: PostMenuProps) {
  const { showToast } = useToast();
  const { handleGlobalBehavior } = useGlobalBehavior();
  const { closePoll } = useClosePoll();
  const { client } = useAuth();
  const [communityData, setCommunityData] = useState<Amity.Community>(null);
  const { deleteByPostId } = globalFeedSlice.actions;
  const dispatch = useUIKitDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const { isFlaggedByMe, reportPost, unreportPost } = useFlagPost({
    postId: post?.postId,
  });

  const { postId, targetType, targetId } = post ?? {};
  const myId = (client as Amity.Client).userId;

  const currentUser = useUser(myId);
  const isGlobalAdmin = isAdmin(currentUser?.roles);

  const { shareLink } = usePostShareAction({ postId, postData: post, pageId });

  const childrenPost = post?.childrenPosts?.[0];

  useEffect(() => {
    if (targetType === 'community' && targetId) {
      getCommunityInfo(targetId);
    }
  }, [targetId, targetType]);

  async function getCommunityInfo(id: string) {
    const { data: community }: { data: Amity.LiveObject<Amity.Community> } =
      await getCommunityById(id);
    if (community.error) return;
    if (!community.loading) {
      setCommunityData(community?.data);
    }
  }

  const goToEditPost = () => {
    closeBottomSheet();
    navigation.navigate('EditPost', { post, community: communityData });
  };

  const deletePost = async () => {
    try {
      const deleted = await deletePostById(postId);
      if (deleted) {
        dispatch(deleteByPostId({ postId }));
        showToast({ type: 'success', message: 'Post deleted.' });
      }
    } catch (error) {
      showToast({
        type: 'failed',
        message: 'Failed to delete post. Please try again.',
      });
    }
  };

  const onDeletePost = () => {
    closeBottomSheet();
    Alert.alert(
      'Delete this post',
      `This post will be permanently deleted. You'll no longer see and find this post`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePost();
            pageId === PageID.post_detail_page && navigation.pop();
          },
        },
      ]
    );
  };

  const actions = [
    {
      show: post?.creator?.userId !== myId && !isFlaggedByMe,
      action: (
        <MenuAction
          key="report"
          gap="small"
          label={'Report post'}
          iconProps={{ xml: report() }}
          onPress={() => {
            closeBottomSheet();
            handleGlobalBehavior({ defaultBehavior: () => reportPost(postId) });
          }}
        />
      ),
    },
    {
      show: post?.creator?.userId !== myId && isFlaggedByMe,
      action: (
        <MenuAction
          key="unreport"
          gap="small"
          iconProps={{ xml: unreport() }}
          label={'Unreport post'}
          onPress={() => {
            closeBottomSheet();
            handleGlobalBehavior({
              defaultBehavior: () => unreportPost(postId),
            });
          }}
        />
      ),
    },
    {
      show:
        post?.creator?.userId === myId &&
        childrenPost?.dataType !== 'room' &&
        childrenPost?.dataType !== 'poll',
      action: (
        <MenuAction
          key="edit"
          gap="small"
          iconProps={{ xml: pen() }}
          label="Edit post"
          onPress={goToEditPost}
        />
      ),
    },
    {
      show:
        post?.creator?.userId === myId &&
        childrenPost?.dataType === 'poll' &&
        (childrenPost as Amity.Post<'poll'>)?.getPollInfo()?.status === 'open',
      action: (
        <MenuAction
          key="close-poll"
          gap="small"
          iconProps={{ xml: poll() }}
          label="Close poll"
          onPress={() => {
            closeBottomSheet();
            closePoll((childrenPost as Amity.Post<'poll'>)?.data?.pollId);
          }}
        />
      ),
    },
    {
      show:
        !!shareLink && targetType === 'community' && !communityData?.isJoined,
      action: (
        <CopyLinkAction
          key="copy-link"
          link={shareLink}
          pageId={pageId}
          componentId={componentId}
          onPress={closeBottomSheet}
        />
      ),
    },
    {
      show:
        !!shareLink && targetType === 'community' && !communityData?.isJoined,
      action: (
        <ShareAction
          key="share"
          link={shareLink}
          pageId={pageId}
          componentId={componentId}
          onPress={closeBottomSheet}
        />
      ),
    },
    {
      show:
        post?.creator?.userId === myId ||
        isModerator(currentUser?.roles) ||
        isGlobalAdmin,
      action: (
        <MenuAction
          key="delete"
          gap="small"
          danger
          iconProps={{ xml: trash() }}
          label="Delete post"
          onPress={onDeletePost}
        />
      ),
    },
  ].filter(({ show }) => show);

  return (
    <MenuButton
      pageId={pageId}
      componentId={componentId}
      hitSlop={12}
      onPress={() => {
        openBottomSheet({
          height: bottomSheetHeight[actions.length],
          content: <View>{actions.map(({ action }) => action)}</View>,
        });
      }}
    />
  );
}
