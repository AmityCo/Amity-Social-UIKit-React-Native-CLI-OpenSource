/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Alert,
  FlatList,
} from 'react-native';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import {
  expandIcon,
  likeCircle,
  personXml,
  threeDots,
} from '../../../../svg/svg-xml-list';

import type { UserInterface, IMentionPosition } from '../../../../types';

import {
  addCommentReaction,
  removeCommentReaction,
} from '../../../../providers/Social/comment-sdk';

import { getAmityUser } from '../../../../providers/user-provider';
import { Pressable } from 'react-native';
import useAuth from '../../../../hooks/useAuth';
import {
  isReportTarget,
  reportTargetById,
  unReportTargetById,
} from '../../../../providers/Social/feed-sdk';
import EditCommentModal from '../../../../components/EditCommentModal';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import { useNavigation } from '@react-navigation/native';
import ReplyCommentList from '../../../../components/Social/ReplyCommentList';
import { CommentRepository } from '@amityco/ts-sdk-react-native';
import { useTimeDifference } from '../../../hook/useTimeDifference';
import { LinkPreview } from '../../PreviewLink';
import { Typography } from '../../Typography/Typography';
import { pen, report, trash, unreport } from '../../../../v4/assets/icons';
import { useToast } from '../../../../v4/hook/useToast';
export interface IComment {
  commentId: string;
  data: Record<string, any>;
  dataType: string | undefined;
  myReactions: string[];
  reactions: Record<string, number>;
  user: UserInterface | undefined;
  updatedAt: string | undefined;
  editedAt: string | undefined;
  createdAt: string;
  childrenComment: string[];
  referenceId: string;
  mentionees?: string[];
  mentionPosition?: IMentionPosition[];
  childrenNumber: number;
}
export interface ICommentList {
  commentDetail: IComment;
  isReplyComment?: boolean;
  onDelete: (commentId: string) => void;
  onClickReply: (user: UserInterface, commentId: string) => void;
  postType: Amity.CommentReferenceType;
  disabledInteraction?: boolean;
  onNavigate?: () => void;
}

const CommentListItem = ({
  commentDetail,
  onDelete,
  onClickReply,
  postType,
  disabledInteraction,
  onNavigate,
}: ICommentList) => {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();

  const {
    commentId,
    data,
    user,
    createdAt,
    reactions,
    myReactions,
    childrenComment,
    editedAt,
    mentionPosition,
    childrenNumber,
    referenceId,
  } = commentDetail ?? {};
  const timeDifference = useTimeDifference(createdAt);
  const [isLike, setIsLike] = useState<boolean>(
    myReactions ? myReactions.includes('like') : false
  );
  const [likeReaction, setLikeReaction] = useState<number>(
    reactions?.like ? reactions?.like : 0
  );

  const { client, apiRegion } = useAuth();
  const [replyCommentList, setReplyCommentList] = useState<IComment[]>([]);
  const [previewReplyCommentList, setPreviewReplyCommentList] = useState<
    IComment[]
  >([]);
  const [replyCommentCollection, setReplyCommentCollection] =
    useState<Amity.LiveCollection<Amity.InternalComment<any>>>();

  const { onNextPage, hasNextPage } = replyCommentCollection ?? {};

  const [isOpenReply, setIsOpenReply] = useState<boolean>(false);
  const [textComment, setTextComment] = useState<string>(data?.text);
  const [isVisible, setIsVisible] = useState(false);
  const [isReportByMe, setIsReportByMe] = useState<boolean>(false);
  const [editCommentModal, setEditCommentModal] = useState<boolean>(false);
  const [isEditComment, setIsEditComment] = useState<boolean>(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  useEffect(() => {
    getReplyComments();
  }, []);

  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };
  const checkIsReport = async () => {
    const isReport = await isReportTarget('comment', commentId);
    if (isReport) {
      setIsReportByMe(true);
    }
  };

  const formatReplyComments = async (
    replyComments,
    isPreviewReply: boolean = false
  ) => {
    if (isPreviewReply) {
      setPreviewReplyCommentList([]);
    } else {
      setReplyCommentList([]);
    }

    if (replyComments && replyComments.length > 0) {
      const formattedCommentList = await Promise.all(
        replyComments.map(async (item: Amity.InternalComment<any>) => {
          const { userObject } = await getAmityUser(item.userId);
          let formattedUserObject: UserInterface;

          formattedUserObject = {
            userId: userObject.data.userId,
            displayName: userObject.data.displayName,
            avatarFileId: userObject.data.avatarFileId,
          };

          return {
            commentId: item.commentId,
            data: item.data as Record<string, any>,
            dataType: item.dataType,
            myReactions: item.myReactions as string[],
            reactions: item.reactions as Record<string, number>,
            user: formattedUserObject as UserInterface,
            updatedAt: item.updatedAt,
            editedAt: item.editedAt,
            createdAt: item.createdAt,
            childrenComment: item.children,
            referenceId: item.referenceId,
            mentionPosition: item?.metadata?.mentioned,
          };
        })
      );
      if (isPreviewReply) {
        setPreviewReplyCommentList([...formattedCommentList]);
      } else {
        setReplyCommentList([...formattedCommentList]);
      }
    }
  };
  const getReplyComments = async () => {
    const getCommentsParams: Amity.CommentLiveCollection = {
      referenceType: postType,
      referenceId: referenceId, // post ID
      dataTypes: { values: ['text', 'image'], matchType: 'any' },
      limit: 3,
      parentId: commentId,
    };

    CommentRepository.getComments(getCommentsParams, (result) => {
      setReplyCommentCollection(result);
      formatReplyComments(result.data);
    });
  };
  const openReplyComment = () => {
    setIsOpenReply(true);
    getReplyComments();
  };
  useEffect(() => {
    checkIsReport();
  }, [childrenComment]);

  const addReactionToComment: () => Promise<void> = async () => {
    if (isLike && likeReaction) {
      setLikeReaction(likeReaction - 1);
      setIsLike(false);
      await removeCommentReaction(commentId, 'like');
    } else {
      setIsLike(true);
      setLikeReaction(likeReaction + 1);
      await addCommentReaction(commentId, 'like');
    }
  };

  const deletePostObject = () => {
    Alert.alert('Delete comment', 'This comment will be permanently deleted.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete && onDelete(commentId),
      },
    ]);
    setIsVisible(false);
  };
  const reportCommentObject = async () => {
    if (isReportByMe) {
      const unReportPost = await unReportTargetById('comment', commentId);
      if (unReportPost) {
        showToast('Comment unreported.');
      }
      setIsVisible(false);
      setIsReportByMe(false);
    } else {
      const reportPost = await reportTargetById('comment', commentId);
      if (reportPost) {
        showToast('Comment reported.');
      }
      setIsVisible(false);
      setIsReportByMe(true);
    }
  };
  const modalStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0], // Adjust this value to control the sliding distance
        }),
      },
    ],
  };

  const openEditCommentModal = () => {
    setIsVisible(false);
    setEditCommentModal(true);
  };
  const onEditComment = (editText: string) => {
    setIsEditComment(true);
    setEditCommentModal(false);
    setTextComment(editText);
  };
  const onCloseEditCommentModal = () => {
    setEditCommentModal(false);
  };

  const onHandleReply = () => {
    onClickReply && onClickReply(user, commentId);
  };

  const onPressCommentReaction = () => {
    onNavigate && onNavigate();
    navigation.navigate('ReactionList', {
      referenceId: commentId,
      referenceType: 'comment',
    });
  };

  return (
    <View key={commentId} style={styles.commentWrap}>
      <View style={styles.headerSection}>
        {user?.avatarFileId ? (
          <Image
            style={styles.avatar}
            source={{
              uri: `https://api.${apiRegion}.amity.co/api/v3/files/${user?.avatarFileId}/download`,
            }}
          />
        ) : (
          <View style={styles.avatar}>
            <SvgXml xml={personXml} width="20" height="16" />
          </View>
        )}
        <View style={styles.rightSection}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>{user?.displayName}</Text>
          </View>

          <View style={styles.commentBubble}>
            {textComment && (
              <LinkPreview
                mentionPositionArr={mentionPosition}
                text={textComment}
              />
            )}
          </View>
          {!disabledInteraction && (
            <View style={styles.actionSection}>
              <View style={styles.rowContainer}>
                <View style={styles.timeRow}>
                  <Typography.Caption style={styles.headerTextTime}>
                    {timeDifference}
                  </Typography.Caption>
                  {(editedAt !== createdAt || isEditComment) && (
                    <Typography.Caption style={styles.headerTextTime}>
                      {' '}
                      (edited)
                    </Typography.Caption>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => addReactionToComment()}
                  style={styles.likeBtn}
                >
                  <Typography.CaptionBold
                    style={isLike ? styles.likedText : styles.btnText}
                  >
                    Like
                  </Typography.CaptionBold>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onHandleReply}
                  style={styles.likeBtn}
                >
                  <Typography.CaptionBold style={styles.btnText}>
                    Reply
                  </Typography.CaptionBold>
                </TouchableOpacity>
                <TouchableOpacity onPress={openModal}>
                  <SvgXml
                    xml={threeDots(theme.colors.baseShade2)}
                    width="20"
                    height="20"
                  />
                </TouchableOpacity>
              </View>

              {likeReaction > 0 && (
                <TouchableOpacity
                  onPress={onPressCommentReaction}
                  style={styles.likeBtn}
                >
                  <Typography.Caption style={styles.btnText}>
                    {likeReaction}
                  </Typography.Caption>
                  <SvgXml xml={likeCircle} width="20" height="20" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {previewReplyCommentList.length > 0 && !isOpenReply && (
            <ReplyCommentList
              commentId={
                previewReplyCommentList[previewReplyCommentList.length - 1]
                  ?.commentId
              }
              commentDetail={
                previewReplyCommentList[previewReplyCommentList.length - 1]
              }
              onDelete={onDelete}
            />
          )}
          {isOpenReply && (
            <FlatList
              data={replyCommentList}
              renderItem={({ item }) => (
                <ReplyCommentList
                  commentId={item.commentId}
                  commentDetail={item}
                  onDelete={onDelete}
                />
              )}
              keyExtractor={(item, index) => item.commentId + index}
            />
          )}

          {childrenComment.length > 0 && !isOpenReply && (
            <TouchableOpacity
              onPress={() => openReplyComment()}
              style={styles.viewMoreReplyBtn}
            >
              <SvgXml xml={expandIcon} />
              <Typography.CaptionBold style={styles.viewMoreText}>
                View {childrenNumber} replies
              </Typography.CaptionBold>
            </TouchableOpacity>
          )}

          {isOpenReply && hasNextPage && (
            <TouchableOpacity
              onPress={() => onNextPage()}
              style={styles.viewMoreReplyBtn}
            >
              <SvgXml xml={expandIcon} />
              <Typography.CaptionBold style={styles.viewMoreText}>
                View more replies
              </Typography.CaptionBold>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              modalStyle,
              user?.userId === (client as Amity.Client).userId &&
                styles.twoOptions,
            ]}
          >
            <View style={styles.handleBar} />
            {user?.userId === (client as Amity.Client).userId ? (
              <View>
                <TouchableOpacity
                  onPress={openEditCommentModal}
                  style={styles.modalRow}
                >
                  <SvgXml
                    width="24"
                    height="24"
                    xml={pen()}
                    color={theme.colors.base}
                  />
                  <Typography.BodyBold style={styles.normalActionText}>
                    Edit Comment
                  </Typography.BodyBold>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={deletePostObject}
                  style={styles.modalRow}
                >
                  <SvgXml
                    width="24"
                    height="24"
                    xml={trash()}
                    color={theme.colors.alert}
                  />
                  <Typography.BodyBold style={styles.dangerActionText}>
                    Delete Comment
                  </Typography.BodyBold>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={reportCommentObject}
                style={styles.modalRow}
              >
                <SvgXml
                  width="24"
                  height="24"
                  color={theme.colors.base}
                  xml={isReportByMe ? unreport() : report()}
                />
                <Typography.BodyBold style={styles.normalActionText}>
                  {isReportByMe ? 'Unreport comment' : 'Report comment'}
                </Typography.BodyBold>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
      <EditCommentModal
        visible={editCommentModal}
        commentDetail={commentDetail}
        onFinishEdit={onEditComment}
        onClose={onCloseEditCommentModal}
      />
    </View>
  );
};
export default CommentListItem;
