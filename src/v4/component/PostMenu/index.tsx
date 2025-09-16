import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useStyles } from './styles';
import { getCommunityById } from '../../../providers/Social/communities-sdk';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsCommunityModerator } from '../../hook';
import {
  deletePostById,
  reportTargetById,
  unReportTargetById,
} from '../../../providers/Social/feed-sdk';
import useAuth from '../../../hooks/useAuth';
import globalFeedSlice from '../../../redux/slices/globalfeedSlice';
import { useDispatch } from 'react-redux';
import { Typography } from '../Typography/Typography';
import { pen, poll, report, trash, unreport } from '../../assets/icons';
import { useToast } from '../../stores/slices/toast';
import { RootStackParamList } from '../../routes/RouteParamList';
import MenuButtonIconElement from '../../PublicApi/Elements/MenuButtonIconElement/MenuButtonIconElement';
import { PostRepository } from '@amityco/ts-sdk-react-native';
import { ComponentID, PageID } from '../../enum';
import { usePoll } from '../../hook/usePoll';
import { useClosePoll } from '../../hook/poll';

type PostMenuProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  post: Amity.Post<any>;
};

export function PostMenu({ pageId, componentId, post }: PostMenuProps) {
  const { showToast } = useToast();
  const { styles, theme } = useStyles();
  const { closePoll, isLoading: isClosePollLoading } = useClosePoll();
  const { client } = useAuth();
  const [communityData, setCommunityData] = useState<Amity.Community>(null);
  const { deleteByPostId } = globalFeedSlice.actions;
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isVisible, setIsVisible] = useState(false);
  const [isReportByMe, setIsReportByMe] = useState(false);

  const [childrenPost, setChildrenPost] = useState<Amity.Post<any> | null>(
    null
  );

  const { poll: pollData } = usePoll(
    (childrenPost as Amity.Post<'poll'>)?.data?.pollId
  );

  const slideAnimation = useRef(new Animated.Value(0)).current;

  const { postId, targetType, targetId } = post ?? {};

  const myId = (client as Amity.Client).userId;

  const { isCommunityModerator: isIAmModerator } = useIsCommunityModerator({
    communityId: targetType === 'community' && targetId,
    userId: myId,
  });

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
    closeModal();
    navigation.navigate('EditPost', { post, community: communityData });
  };

  const openModal = () => setIsVisible(true);

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const checkIsReport = useCallback(async () => {
    const isReport = await PostRepository.isPostFlaggedByMe(postId);
    setIsReportByMe(!!isReport);
  }, [postId]);

  const getChildrenPost = useCallback(async () => {
    const unsubscribe = PostRepository.getPost(
      post?.children?.[0],
      ({ data, loading }) => {
        if (!loading) setChildrenPost(data);
      }
    );
    return () => unsubscribe();
  }, [post]);

  useEffect(() => {
    if (isVisible) {
      checkIsReport();
      getChildrenPost();
    }
  }, [checkIsReport, getChildrenPost, isVisible]);

  const deletePost = async () => {
    try {
      const deleted = await deletePostById(postId);
      if (deleted) {
        dispatch(deleteByPostId({ postId }));
        showToast({ type: 'success', message: 'Post deleted.' });
        pageId === PageID.post_detail_page && navigation.pop();
      }
    } catch (error) {
      showToast({
        type: 'failed',
        message: 'Failed to delete post. Please try again.',
      });
    }
  };

  const onDeletePost = () => {
    setIsVisible(false);
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
          onPress: () => deletePost(),
        },
      ]
    );
  };

  const onClosePoll = () => {
    setIsVisible(false);
    Alert.alert(
      'Close poll?',
      "The poll duration you've set will be ignored and your poll will be closed immediately.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Close poll',
          style: 'destructive',
          onPress: () => {
            if (!isClosePollLoading) {
              closePoll({
                pollId: (childrenPost as Amity.Post<'poll'>)?.data?.pollId,
                onSuccess: () => {
                  showToast({ message: 'Post closed.', type: 'success' });
                },
                onError: () => {
                  showToast({
                    type: 'failed',
                    message: 'Oops, something went wrong.',
                  });
                },
              });
            }
          },
        },
      ]
    );
    setIsVisible(false);
  };

  const reportPostObject = async () => {
    setIsVisible(false);
    if (isReportByMe) {
      try {
        await unReportTargetById('post', postId);
        showToast({ message: 'Post unreported', type: 'success' });
      } catch (error) {
        showToast({
          message: 'Failed to unreport post. Please try again.',
          type: 'failed',
        });
      }
    } else {
      try {
        await reportTargetById('post', postId);
        showToast({ message: 'Post reported', type: 'success' });
      } catch (error) {
        showToast({
          message: 'Failed to report post. Please try again.',
          type: 'failed',
        });
      }
    }
    checkIsReport();
  };

  return (
    <Fragment>
      <Pressable onPress={openModal} hitSlop={12}>
        <MenuButtonIconElement
          pageID={pageId}
          style={styles.menuIcon}
          componentID={componentId}
        />
      </Pressable>
      <Modal
        transparent={true}
        visible={isVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} style={styles.modal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [580, 0],
                    }),
                  },
                ],
              },
              (post?.creator?.userId === myId || isIAmModerator) &&
                ((childrenPost?.dataType !== 'liveStream' &&
                  childrenPost?.dataType !== 'poll') ||
                  (childrenPost?.dataType === 'poll' &&
                    pollData?.status === 'open')) &&
                styles.twoOptions,
            ]}
          >
            <View style={styles.handleBar} />
            {post?.creator?.userId !== myId && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={reportPostObject}
              >
                <SvgXml
                  width="24"
                  height="24"
                  color={theme.colors.base}
                  xml={isReportByMe ? unreport() : report()}
                />
                <Typography.BodyBold style={styles.base}>
                  {isReportByMe ? 'Unreport post' : 'Report post'}
                </Typography.BodyBold>
              </TouchableOpacity>
            )}
            {post?.creator?.userId === myId &&
              childrenPost?.dataType !== 'liveStream' &&
              childrenPost?.dataType !== 'poll' && (
                <TouchableOpacity
                  onPress={goToEditPost}
                  style={styles.menuItem}
                >
                  <SvgXml
                    width="24"
                    height="24"
                    xml={pen()}
                    color={theme.colors.base}
                  />
                  <Typography.BodyBold style={styles.base}>
                    Edit post
                  </Typography.BodyBold>
                </TouchableOpacity>
              )}
            {post?.creator?.userId === myId &&
              childrenPost?.dataType === 'poll' &&
              pollData?.status === 'open' && (
                <TouchableOpacity onPress={onClosePoll} style={styles.menuItem}>
                  <SvgXml
                    width="24"
                    height="24"
                    xml={poll()}
                    color={theme.colors.base}
                  />
                  <Typography.BodyBold style={styles.base}>
                    Close poll
                  </Typography.BodyBold>
                </TouchableOpacity>
              )}
            {(post?.creator?.userId === myId || isIAmModerator) && (
              <TouchableOpacity style={styles.menuItem} onPress={onDeletePost}>
                <SvgXml
                  width="24"
                  height="24"
                  xml={trash()}
                  color={theme.colors.alert}
                />
                <Typography.BodyBold style={styles.alert}>
                  Delete post
                </Typography.BodyBold>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </Fragment>
  );
}
