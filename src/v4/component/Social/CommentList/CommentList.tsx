import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useState, useRef, memo } from 'react';
import { UserInterface, IMentionPosition } from '../../../../types';
import { getAmityUser } from '../../../../providers/user-provider';
import { CommentRepository } from '@amityco/ts-sdk-react-native';
import CommentListItem from '../CommentListItem/CommentListItem';
import {
  createComment,
  createReplyComment,
  deleteCommentById,
} from '../../../../providers/Social/comment-sdk';
import { useStyles } from './styles';
import { TSearchItem } from '../../../../hooks/useSearch';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import { closeIcon } from '../../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';
import { usePaginatorApi } from '../../../hook/usePaginator';
import { isAmityAd } from '../../../hook/useCustomRankingGlobalFeed';
import CommentAdComponent from '../../CommentAdComponent/CommentAdComponent';
import useMention from '../../../../v4/hook/useMention';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import MyAvatar from '../../MyAvatar/MyAvatar';
import { useToast } from '../../../hook/useToast';

interface ICommentListProp {
  postId: string;
  postType: Amity.CommentReferenceType;
  disabledInteraction?: boolean;
  onNavigate?: () => void;
  withAvatar?: boolean;
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
  disabledInteraction,
  onNavigate,
  withAvatar,
}) => {
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const onNextPageRef = useRef<() => void | null>(null);
  const [commentList, setCommentList] = useState<IComment[]>([]);
  const [replyUserName, setReplyUserName] = useState<string>('');
  const [replyCommentId, setReplyCommentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [mentionNames, setMentionNames] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );
  const { showCommentErrorToast } = useToast();

  const { renderInput, renderSuggestions } = useMention({
    value: inputMessage,
    onChange: setInputMessage,
    setMentionUsers: (user: TSearchItem) => {
      setMentionNames((prev) => [...prev, user]);
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
      async ({ error, loading, data, hasNextPage, onNextPage }) => {
        if (error) return;
        if (!loading) {
          data && data.length > 0 && (await queryComment(data));
          onNextPageRef.current = hasNextPage ? onNextPage : null;
        }
      }
    );
    return () => {
      setCommentList([]);
    };
  }, [postId, postType]);

  useEffect(() => {
    const checkMentionNames = mentionNames.filter((item) => {
      return inputMessage.includes(item.displayName);
    });
    const checkMentionPosition = mentionsPosition.filter((item) => {
      return inputMessage.includes(item.displayName as string);
    });
    setMentionNames(checkMentionNames);
    setMentionsPosition(checkMentionPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  const queryComment = async (comments: Amity.InternalComment[]) => {
    const formattedCommentList = await Promise.all(
      comments.map(async (item: Amity.Comment) => {
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
      })
    );
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
    setInputMessage('');
    Keyboard.dismiss();
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
      }
    }
    setInputMessage('');
    setMentionNames([]);
    setMentionsPosition([]);
    onCloseReply();
  };

  const renderFooterComponent = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.commentListFooter}
      >
        {renderSuggestions({
          type: 'comment',
          style: styles.suggestionContainer,
        })}
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
        {!disabledInteraction && (
          <View style={styles.inputWrap}>
            {withAvatar && <MyAvatar />}
            <View style={styles.inputContainer}>
              {renderInput({
                multiline: true,
                style: styles.textInput,
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
        )}
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={itemWithAds}
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
              disabledInteraction={disabledInteraction}
              onNavigate={onNavigate}
            />
          );
        }}
        keyExtractor={(item, index) =>
          (isAmityAd(item) ? item.adId : item.commentId) + `_${index}`
        }
        onEndReachedThreshold={0.8}
        onEndReached={() => onNextPageRef.current && onNextPageRef.current()}
      />
      {renderFooterComponent()}
    </View>
  );
};

export default memo(CommentList);
