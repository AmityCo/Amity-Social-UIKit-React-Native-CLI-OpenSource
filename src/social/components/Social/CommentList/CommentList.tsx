import {
  Alert,
  FlatList,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FC, useEffect, useState, useRef, memo } from 'react';
import { UserInterface, IMentionPosition } from '../../../../core/types';
import { CommentRepository } from '@amityco/ts-sdk-react-native';
import CommentListItem from '../CommentListItem/CommentListItem';
import {
  createComment,
  createReplyComment,
  deleteCommentById,
} from '../../../../core/legacy/comment';
import { useStyles } from './styles';
import { TSearchItem } from '../../../../core/hooks/useSearch';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';
import { closeIcon } from '../../../../core/assets/icons/xml';
import { SvgXml } from 'react-native-svg';
import { usePaginatorApi } from '../../../hooks/usePaginator';
import { isAmityAd } from '../../../hooks/useCustomRankingGlobalFeed';
import CommentAdComponent from '../../CommentAdComponent/CommentAdComponent';
import useMention from '../../../hooks/useMention';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import MyAvatar from '../../MyAvatar/MyAvatar';
import { useToast } from '../../../../core/stores/slices/toastSlice';
import { lock } from '../../../../core/assets/icons';
import { Typography } from '../../../../core/components/Typography/Typography';
import { MAX_MENTION_USERS } from '../../../../core/constants';
import useAuth from '../../../../core/hooks/useAuth';

interface ICommentListProp {
  postId: string;
  postType: Amity.CommentReferenceType;
  disabledInteraction?: boolean;
  onNavigate?: (userId: string) => void;
  withAvatar?: boolean;
  disabledComment?: boolean;
}

interface IComment {
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

const commentListLimit = 8;

const CommentList: FC<ICommentListProp> = ({
  postId,
  postType,
  disabledInteraction: disabledInteractionProp,
  onNavigate,
  withAvatar,
  disabledComment,
}) => {
  // Web parity: visitors can never comment, reply, or react
  const { isVisitorOrBot } = useAuth();
  const disabledInteraction = disabledInteractionProp || isVisitorOrBot;
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const onNextPageRef = useRef<() => void | null>(null);
  const [commentList, setCommentList] = useState<IComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [replyUserName, setReplyUserName] = useState<string>('');
  const [replyCommentId, setReplyCommentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [mentionNames, setMentionNames] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );
  const [inputBarHeight, setInputBarHeight] = useState(0);

  const { showCommentErrorToast } = useToast();
  const { renderInput, renderSuggestions } = useMention({
    value: inputMessage,
    onChange: setInputMessage,
    setMentionUsers: (user: TSearchItem) => {
      setMentionNames((prev) => {
        if (prev.some((mentionedUser) => mentionedUser.id === user.id)) {
          return prev;
        }

        if (prev.length >= MAX_MENTION_USERS) {
          Alert.alert(
            'Too many users mentioned',
            `You can only mention up to ${MAX_MENTION_USERS} users per post.`,
            [{ text: 'OK' }]
          );
          return prev;
        }

        return [...prev, user];
      });
    },
    setMentionPosition: (position: IMentionPosition) => {
      setMentionsPosition((prev) => [...prev, position]);
    },
  });

  const { itemWithAds } = usePaginatorApi<IComment>({
    items: commentList,
    placement: 'comment' as Amity.AdPlacement,
    pageSize: commentListLimit,
    getItemId: (item) => item.commentId,
  });

  useEffect(() => {
    CommentRepository.getComments(
      {
        dataTypes: { matchType: 'any', values: ['text', 'image'] },
        referenceId: postId,
        referenceType: postType,
        limit: commentListLimit,
      },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        setLoadingComments(loading);
        if (error) return;
        if (!loading) {
          data && data.length > 0 && queryComment(data);
          onNextPageRef.current = hasNextPage ? onNextPage : null;
        }
      }
    );
    return () => {
      setCommentList([]);
    };
  }, [postId, postType]);

  useEffect(() => {
    // Parse active mention user IDs directly from the controlled-mentions
    // value format: {@}[DisplayName](userId)
    // Using displayName.includes() is unreliable — the same name can appear as
    // plain text, and deletions may not remove the entry correctly.
    const mentionTokenRegex = /\{@\}\[([^\]]*)\]\(([^)]*)\)/g;
    const activeUserIds = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = mentionTokenRegex.exec(inputMessage)) !== null) {
      activeUserIds.add(match[2]); // userId is capture group 2
    }
    setMentionNames((prev) =>
      prev.filter((item) => activeUserIds.has(item.id))
    );
    setMentionsPosition((prev) =>
      prev.filter((item) => activeUserIds.has(item.userId))
    );
  }, [inputMessage]);

  const queryComment = async (comments: Amity.InternalComment[]) => {
    const formattedCommentList = comments.map((item: Amity.Comment) => {
      let formattedUserObject: UserInterface;

      formattedUserObject = {
        userId: item?.creator?.userId,
        displayName: item?.creator?.displayName,
        avatarFileId: item?.creator?.avatarFileId,
      };

      return {
        commentId: item.commentId,
        data: item.data as Record<string, any>,
        dataType: item.dataType || 'text',
        myReactions: item.myReactions as string[],
        reactions: item.reactions as Record<string, number>,
        user: formattedUserObject as UserInterface,
        updatedAt: item.updatedAt,
        editedAt: item.editedAt,
        createdAt: item.createdAt,
        childrenComment: item.children,
        childrenNumber: item.childrenNumber,
        referenceId: item.referenceId,
        mentionPosition: item?.metadata?.mentioned ?? [],
      };
    });
    setCommentList([...formattedCommentList]);
  };

  const onDeleteComment = async (commentId: string) => {
    const isDeleted = await deleteCommentById(commentId);
    if (isDeleted) {
      const prevCommentList: IComment[] = [...commentList];
      const updatedCommentList: IComment[] = prevCommentList.filter(
        (item) => item.commentId !== commentId
      );
      setCommentList(updatedCommentList);
    }
  };

  const handleClickReply = (user: UserInterface, commentId: string) => {
    setReplyUserName(user.displayName);
    setReplyCommentId(commentId);
  };

  const onCloseReply = () => {
    setReplyUserName('');
    setReplyCommentId('');
  };

  const handleSend: () => Promise<void> = async () => {
    if (inputMessage.trim() === '') {
      return;
    }
    if (mentionNames.length > MAX_MENTION_USERS) {
      Alert.alert(
        'Too many users mentioned',
        'You can only mention up to 30 users per post.',
        [{ text: 'OK' }]
      );
      return;
    }
    const comment = replaceTriggerValues(
      inputMessage,
      ({ name }) => `@${name}`
    );
    if (replyCommentId.length > 0) {
      try {
        await createReplyComment(
          comment,
          postId,
          replyCommentId,
          mentionNames?.map((item) => item.id),
          mentionsPosition,
          postType
        );
      } catch (error) {
        showCommentErrorToast(error);
        return;
      }
    } else {
      try {
        await createComment(
          comment,
          postId,
          mentionNames?.map((item) => item.id),
          mentionsPosition,
          postType
        );
      } catch (error) {
        showCommentErrorToast(error);
        return;
      }
    }
    setInputMessage('');
    Keyboard.dismiss();
    setMentionNames([]);
    setMentionsPosition([]);
    onCloseReply();
  };

  const renderFooterComponent = () => {
    return (
      <View style={styles.commentListFooter}>
        {renderSuggestions({
          type: 'comment',
          style: styles.suggestionContainer,
          bottom: inputBarHeight,
        })}
        <View onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}>
          {replyUserName.length > 0 && (
            <View style={styles.replyLabelWrap}>
              <Text style={styles.replyLabel}>
                Replying to{' '}
                <Text style={styles.userNameLabel}>{replyUserName}</Text>
              </Text>
              <TouchableOpacity>
                <TouchableOpacity onPress={onCloseReply}>
                  <SvgXml
                    style={styles.closeIcon}
                    xml={closeIcon(theme.colors.baseShade2)}
                    width={20}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
          {!disabledInteraction &&
            (disabledComment ? (
              <View style={styles.disabledCommentWrap}>
                <SvgXml
                  width={20}
                  height={20}
                  xml={lock()}
                  color={theme.colors.baseShade2}
                />
                <Typography.Body style={styles.disabledCommentText}>
                  Comments are disabled for this story
                </Typography.Body>
              </View>
            ) : (
              <View style={styles.inputWrap}>
                {withAvatar && <MyAvatar />}
                <View style={styles.inputContainer}>
                  {renderInput({
                    multiline: true,
                    scrollEnabled: true,
                    style: [styles.textInput, { lineHeight: 20 }],
                    placeholder: 'Say something nice...',
                    placeholderTextColor: theme.colors.baseShade3,
                  })}
                </View>
                <TouchableOpacity
                  disabled={inputMessage.length > 0 ? false : true}
                  onPress={handleSend}
                  style={styles.postBtn}
                >
                  <Text
                    style={
                      inputMessage.length > 0
                        ? styles.postBtnText
                        : styles.postDisabledBtn
                    }
                  >
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={itemWithAds}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if (isAmityAd(item)) {
            return <CommentAdComponent ad={item} />;
          }
          return (
            <CommentListItem
              onDelete={onDeleteComment}
              commentDetail={item}
              onClickReply={handleClickReply}
              postType={postType}
              disabledComment={disabledComment}
              disabledInteraction={disabledInteraction}
              onNavigate={onNavigate}
            />
          );
        }}
        keyExtractor={(item, index) =>
          (isAmityAd(item) ? item.adId : item.commentId) + `_${index}`
        }
        ListEmptyComponent={
          loadingComments ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
            </View>
          )
        }
        onEndReachedThreshold={0.8}
        onEndReached={() => onNextPageRef.current && onNextPageRef.current()}
      />
      {renderFooterComponent()}
    </View>
  );
};

export default memo(CommentList);
