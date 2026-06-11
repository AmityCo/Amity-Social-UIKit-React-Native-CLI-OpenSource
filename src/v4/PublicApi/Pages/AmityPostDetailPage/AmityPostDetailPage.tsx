import {
  Pressable,
  View,
  Alert,
  Keyboard,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
} from 'react';
import { ComponentID, PageID } from '../../../../v4/enum/';
import { TSearchItem, useAmityPage } from '../../../../v4/hook';
import useAuth from '../../../../hooks/useAuth';
import { useStyles } from './styles';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  PostRepository,
  SubscriptionLevels,
  getPostTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import AmityPostContentComponent from '../../../../v4/PublicApi/Components/AmityPostContentComponent/AmityPostContentComponent';
import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '../../../../v4/enum/AmityPostContentComponentStyle';
import AmityPostCommentComponent from '../../../../v4/PublicApi/Components/AmityPostCommentComponent/AmityPostCommentComponent';

import { closeIcon } from '../../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';
import { IMentionPosition } from '../../../../types';
import uiSlice from '../../../../redux/slices/uiSlice';
import NetInfo from '@react-native-community/netinfo';
import { useToast } from '../../../../v4/stores/slices/toast';
import MyAvatar from '../../../../v4/component/MyAvatar/MyAvatar';
import {
  comment_contains_inapproproate_word,
  text_contain_blocked_word,
} from '../../../../constants';

import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorComponent from '../../../../v4/component/ErrorComponent/ErrorComponent';
import { getSkeletonBackgrounColor } from '../../../../util/colorUtil';
import ContentLoader, { Circle, Rect } from 'react-content-loader/native';
import { PostMenu } from '../../../../v4/component/PostMenu';
import useMention from '../../../../v4/hook/useMention';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import {
  createComment,
  createReplyComment,
} from '../../../../providers/Social/comment-sdk';
import { useUIKitDispatch } from '../../../../redux/store';

type AmityPostDetailPageType = {
  postId: Amity.Post['postId'];
  isFromComponent?: boolean;
  showEndPopup?: boolean;
  category?: AmityPostCategory;
  isDeleted?: boolean;
};

const AmityPostDetailPage: FC<AmityPostDetailPageType> = ({
  postId,
  isFromComponent,
  showEndPopup,
  category,
  isDeleted,
}) => {
  const pageId = PageID.post_detail_page;
  const dispatch = useUIKitDispatch();
  const componentId = ComponentID.WildCardComponent;
  // Web parity (CommentTray.canShowComposer): visitors cannot comment,
  // reply, react, or open the comment actions menu.
  const { isVisitorOrBot } = useAuth();
  const disabledInteraction = isVisitorOrBot;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isExcluded, themeStyles, accessibilityId } = useAmityPage({ pageId });
  const styles = useStyles(themeStyles);
  const { showToast } = useToast();
  const [postData, setPostData] = useState<Amity.Post<any>>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [replyUserName, setReplyUserName] = useState<string>('');
  const [replyCommentId, setReplyCommentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [mentionNames, setMentionNames] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );

  const [showLivestreamEndPopup, setShowLivestreamEndPopup] = useState<boolean>(
    showEndPopup || false
  );

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

  const { showToastMessage } = uiSlice.actions;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        showToast({
          type: 'failed',
          message: 'No internet connection.',
          duration: 3000,
          bottomPosition: 96,
        });
      }
    });
    return () => unsubscribe();
  }, [showToast]);

  useLayoutEffect(() => {
    if (!postId) return () => {};
    setLoading(true);
    let unsub: () => void;
    let hasSubscribed = false;
    const postUnsub = PostRepository.getPost(
      postId,
      async ({ error, loading: postLoading, data }) => {
        if (!error && !postLoading) {
          if (!hasSubscribed) {
            unsub = subscribeTopic(
              getPostTopic(data, SubscriptionLevels.COMMENT)
            );
            hasSubscribed = true;
          }

          setPostData(data);
        }
        setLoading(postLoading);
      }
    );

    return () => {
      postUnsub();
      unsub && unsub();
    };
  }, [postId]);

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

  const onPressBack = useCallback(() => {
    const routes = navigation.getState().routes;
    if (isFromComponent && routes.length === 1) {
      navigation.navigate('AmitySocialHomePage');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AmitySocialHomePage' }],
        })
      );
    } else {
      if (routes[routes.length - 2]?.name === 'CreateLivestream')
        return navigation.pop(3);
      navigation.goBack();
    }
    // if the previous screen is CreateLivestream, skip createLivestream and selectTarget screen
  }, [navigation, isFromComponent]);

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
          'post'
        );
      } catch (error) {
        if (error.message.includes(text_contain_blocked_word)) {
          dispatch(
            showToastMessage({
              toastMessage: comment_contains_inapproproate_word,
            })
          );
          return;
        }
      }
    } else {
      try {
        await createComment(
          comment,
          postId,
          mentionNames?.map((item) => item.id),
          mentionsPosition,
          'post'
        );
      } catch (error) {
        if (error.message.includes(text_contain_blocked_word)) {
          dispatch(
            showToastMessage({
              toastMessage: comment_contains_inapproproate_word,
            })
          );
          return;
        }
      }
    }
    setInputMessage('');
    setMentionNames([]);
    setMentionsPosition([]);
    onCloseReply();
  };

  const renderFooterComponent = () => {
    return (
      <View style={styles.commentListFooter}>
        {renderSuggestions({ type: 'comment' })}
        <View>
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
                    xml={closeIcon(themeStyles.colors.baseShade2)}
                    width={20}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
          {!disabledInteraction && (
            <View style={styles.InputWrap}>
              <MyAvatar style={styles.myAvatar} />
              <View style={styles.inputContainer}>
                {renderInput({
                  multiline: true,
                  placeholder: 'Say something nice...',
                  placeholderTextColor: themeStyles.colors.baseShade3,
                  style: styles.input,
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
        </View>
      </View>
    );
  };

  const renderLivestreamEndPopup = () => {
    Alert.alert(
      'Live stream ended',
      'Your live stream has been automatically terminated since you reached 4-hour limit.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowLivestreamEndPopup(false);
          },
        },
      ]
    );
  };

  useEffect(() => {
    showLivestreamEndPopup && renderLivestreamEndPopup();
  }, [showLivestreamEndPopup]);

  if (isExcluded) return null;

  if (isDeleted || postData?.isDeleted) {
    return (
      <ErrorComponent
        themeStyle={themeStyles}
        onPress={onPressBack}
        title="Something went wrong"
        description="The content you're looking for is unavailable."
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView
        edges={['top']}
        testID={accessibilityId}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={onPressBack}>
            <BackButtonIconElement
              pageID={pageId}
              componentID={componentId}
              style={styles.headerIcon}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Post</Text>
          <PostMenu post={postData} pageId={pageId} componentId={componentId} />
        </View>
        <View style={[styles.scrollContainer]}>
          {loading ? (
            <View style={styles.skeletonContainer}>
              <ContentLoader
                speed={1}
                {...getSkeletonBackgrounColor(themeStyles)}
              >
                <Circle cx="16" cy="16" r="16" />
                <Rect x="40" y="4" width="180" height="8" rx="3" />
                <Rect x="40" y="20" width="64" height="8" rx="3" />
                <Rect x="0" y="56" width="240" height="8" rx="3" />
                <Rect x="0" y="76" width="180" height="8" rx="3" />
                <Rect x="0" y="96" width="300" height="8" rx="3" />
              </ContentLoader>
            </View>
          ) : (
            <AmityPostCommentComponent
              setReplyUserName={setReplyUserName}
              setReplyCommentId={setReplyCommentId}
              postId={postId}
              communityId={
                postData?.targetType === 'community' && postData?.targetId
              }
              postType="post"
              disabledInteraction={disabledInteraction}
              ListHeaderComponent={
                postData && (
                  <AmityPostContentComponent
                    post={postData}
                    showedAllOptions
                    category={category}
                    AmityPostContentComponentStyle={
                      AmityPostContentComponentStyleEnum.detail
                    }
                    pageId={pageId}
                  />
                )
              }
            />
          )}
        </View>
        {renderFooterComponent()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default memo(AmityPostDetailPage);
