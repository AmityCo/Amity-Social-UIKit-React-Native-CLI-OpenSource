import React, { useCallback, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '../../svg/svg-xml-list';
import { useStyles } from './styles';
import type { IComment } from '../../v4/PublicApi/Components/AmityPostCommentComponent/CommentListItem/CommentListItem';
import { editComment } from '../../providers/Social/comment-sdk';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { TSearchItem } from '~/v4/hook';
import { IMentionPosition } from '~/v4/types/type';
import {
  CommunityRepository,
  UserRepository,
} from '@amityco/ts-sdk-react-native';
import useMention from '../../v4/hook/useMention';
import { replaceTriggerValues } from 'react-native-controlled-mentions';

interface IModal {
  visible: boolean;
  userId?: string;
  onClose: () => void;
  onFinishEdit: (editText: string) => void;
  commentDetail: IComment;
}
const EditCommentModal = ({
  visible,
  onClose,
  commentDetail,
  onFinishEdit,
}: IModal) => {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();
  const [inputMessage, setInputMessage] = useState(
    commentDetail?.data?.text ?? ''
  );
  const [mentionUsers, setMentionUsers] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );
  const [privateCommunityId, setPrivateCommunityId] = useState<string>(null);

  const { renderInput, renderSuggestions } = useMention({
    value: inputMessage,
    communityId: privateCommunityId,
    onChange: setInputMessage,
    setMentionUsers: (user: TSearchItem) => {
      setMentionUsers((prev) => [...prev, user]);
    },
    setMentionPosition: (position: IMentionPosition) => {
      setMentionsPosition((prev) => [...prev, position]);
    },
  });

  const handleEditComment = async () => {
    if (inputMessage) {
      const comment = replaceTriggerValues(
        inputMessage,
        ({ name }) => `@${name}`
      );
      const mentionedUserIds = mentionUsers.map((user) => user.userId);
      const editedComment = await editComment(
        comment,
        commentDetail.commentId,
        'post',
        mentionedUserIds,
        mentionsPosition
      );
      if (editedComment) {
        onFinishEdit &&
          onFinishEdit((editedComment?.data as Amity.ContentDataText)?.text);
      }
    }
  };
  const disabledState =
    !inputMessage || inputMessage === commentDetail?.data?.text;
  const disabledColor = disabledState && { color: theme.colors.baseShade2 };

  const parsePostText = useCallback(
    (text: string, mentionUsersArr: TSearchItem[]) => {
      const parsedText = text.replace(/@([\w\s-]+)/g, (_, username) => {
        const mentionee = mentionUsersArr.find(
          (user) => user.displayName === username
        );
        const mentioneeId = mentionee ? mentionee.userId : '';
        return `{@}[${username}](${mentioneeId})`;
      });
      return parsedText;
    },
    []
  );

  const getMentionPositions = useCallback(
    (text: string, mentioneeIds: string[]) => {
      let index = 0;
      let mentions = [];
      let match;
      const mentionRegex = /@([\w-]+)/g;

      while ((match = mentionRegex.exec(text)) !== null) {
        let username = match[1];
        let mentioneeId = mentioneeIds[index++];
        let startIdx = match.index;
        let mention = {
          type: 'user',
          displayName: username,
          index: startIdx,
          length: match[0].length,
          userId: mentioneeId,
        };
        mentions.push(mention);
      }
      return mentions;
    },
    []
  );

  const getMentionUsers = useCallback(
    async (mentionIds: string[]) => {
      const { data } = await UserRepository.getUserByIds(mentionIds);
      const users = data.map((user) => {
        return {
          ...user,
          name: user.displayName,
          id: user.userId,
        };
      }) as TSearchItem[];

      setMentionUsers(users);
      const parsedText = parsePostText(commentDetail?.data?.text ?? '', users);
      setInputMessage(parsedText);
      return users;
    },
    [parsePostText, commentDetail?.data?.text]
  );

  useEffect(() => {
    if (visible) {
      if (commentDetail?.mentionPosition?.length > 0) {
        const mentionPositions = getMentionPositions(
          commentDetail?.data?.text ?? '',
          commentDetail.mentionPosition.map((position) => position.userId) ?? []
        );
        getMentionUsers(
          commentDetail.mentionPosition.map((position) => position.userId) ?? []
        );
        setMentionsPosition(mentionPositions);
      } else {
        setInputMessage(commentDetail?.data?.text ?? '');
      }
    }
  }, [getMentionPositions, getMentionUsers, commentDetail, visible]);

  useEffect(() => {
    if (commentDetail?.targetType === 'community' && visible) {
      CommunityRepository.getCommunity(
        commentDetail?.targetId,
        ({ error, data, loading }) => {
          if (!error && !loading) {
            !data.isPublic && setPrivateCommunityId(data.communityId);
          }
        }
      );
    }

    return () => {};
  }, [commentDetail?.targetId, commentDetail?.targetType, visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <SvgXml xml={closeIcon(theme.colors.base)} width="17" height="17" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Edit Comment</Text>
        </View>
        <TouchableOpacity
          onPress={handleEditComment}
          style={styles.headerTextContainer}
          disabled={disabledState}
        >
          <Text style={[styles.headerText, disabledColor]}>Save</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
        style={styles.AllInputWrap}
      >
        <View style={styles.container}>
          <View style={styles.AllInputWrap}>
            <ScrollView style={styles.container}>
              {renderInput({
                multiline: true,
                placeholder: 'What are you thinking...',
                placeholderTextColor: theme.colors.baseShade3,
              })}
            </ScrollView>
          </View>
        </View>
        {renderSuggestions({ type: 'post' })}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditCommentModal;
