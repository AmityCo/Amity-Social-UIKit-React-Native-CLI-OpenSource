import {
  Pressable,
  SafeAreaView,
  View,
  Alert,
  Keyboard,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react';
import { ComponentID, PageID } from '../../../enum/';
import { TSearchItem, useAmityPage } from '../../../hook';
import { useStyles } from './styles';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  PostRepository,
  SubscriptionLevels,
  getPostTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import AmityPostContentComponent from '../../Components/AmityPostContentComponent/AmityPostContentComponent';
import { AmityPostContentComponentStyleEnum } from '../../../enum/AmityPostContentComponentStyle';
import AmityPostCommentComponent from '../../Components/AmityPostCommentComponent/AmityPostCommentComponent';
import {
  createComment,
  createReplyComment,
} from '../../../../providers/Social/comment-sdk';
import { closeIcon } from '../../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';
import { IMentionPosition } from '~/types';
import AmityMentionInput from '../../../../components/MentionInput/AmityMentionInput';
import { useDispatch } from 'react-redux';
import uiSlice from '../../../../redux/slices/uiSlice';
import MyAvatar from '../../../component/MyAvatar/MyAvatar';
import {
  comment_contains_inapproproate_word,
  text_contain_blocked_word,
} from '../../../../constants';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ErrorComponent from '../../../component/ErrorComponent/ErrorComponent';
import { getSkeletonBackgrounColor } from '../../../../util/colorUtil';
import ContentLoader, { Circle, Rect } from 'react-content-loader/native';
import { PostMenu } from '../../../component/PostMenu';

type AmityPostDetailPageType = {
  postId: Amity.Post['postId'];
  isFromComponent?: boolean;
  showEndPopup?: boolean;
};

const AmityPostDetailPage: FC<AmityPostDetailPageType> = ({
  postId,
  isFromComponent,
  showEndPopup,
}) => {
  const { top, bottom } = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const pageId = PageID.post_detail_page;
  const dispatch = useDispatch();
  const componentId = ComponentID.WildCardComponent;
  const disabledInteraction = false;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isExcluded, themeStyles, accessibilityId } = useAmityPage({ pageId });
  const styles = useStyles(themeStyles);
  const [postData, setPostData] = useState<Amity.Post<any>>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [replyUserName, setReplyUserName] = useState<string>('');
  const [replyCommentId, setReplyCommentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [resetValue, setResetValue] = useState(false);
  const [mentionNames, setMentionNames] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );

  const [topBarHeigh, setTopBarHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showLivestreamEndPopup, setShowLivestreamEndPopup] = useState<boolean>(
    showEndPopup || false
  );

  const adjustedHeight =
    height -
    (footerHeight +
      (isKeyboardVisible ? keyboardHeight : 0) +
      top +
      bottom +
      topBarHeigh);

  const { showToastMessage } = uiSlice.actions;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
      navigation.navigate('Home');
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

  const handleSend: () => Promise<void> = useCallback(async () => {
    setResetValue(false);
    if (inputMessage.trim() === '') {
      return;
    }
    setInputMessage('');
    Keyboard.dismiss();
    if (replyCommentId.length > 0) {
      try {
        await createReplyComment(
          inputMessage,
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
          inputMessage,
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
    setResetValue(true);
  }, [
    dispatch,
    inputMessage,
    mentionNames,
    mentionsPosition,
    postId,
    replyCommentId,
    showToastMessage,
  ]);

  const renderFooterComponent = useMemo(() => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.commentListFooter}
      >
        <View
          onLayout={(event: LayoutChangeEvent) => {
            const { height: layoutHeight } = event.nativeEvent.layout;
            setFooterHeight(layoutHeight);
          }}
        >
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
                <AmityMentionInput
                  resetValue={resetValue}
                  initialValue=""
                  privateCommunityId={null}
                  multiline
                  placeholder="Say something nice..."
                  placeholderTextColor={themeStyles.colors.baseShade3}
                  mentionUsers={mentionNames}
                  setInputMessage={setInputMessage}
                  setMentionUsers={setMentionNames}
                  mentionsPosition={mentionsPosition}
                  setMentionsPosition={setMentionsPosition}
                  isBottomMentionSuggestionsRender={false}
                />
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
      </KeyboardAvoidingView>
    );
  }, [
    disabledInteraction,
    handleSend,
    inputMessage.length,
    mentionNames,
    mentionsPosition,
    replyUserName,
    resetValue,
    styles,
    themeStyles,
  ]);

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

  if (postData?.isDeleted) {
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
    <SafeAreaView testID={accessibilityId} style={styles.container}>
      <View
        style={[
          styles.scrollContainer,
          {
            paddingTop: topBarHeigh,
            paddingBottom: isKeyboardVisible
              ? (Platform.OS !== 'android' ? keyboardHeight : 0) +
                footerHeight -
                topBarHeigh -
                bottom
              : footerHeight - topBarHeigh,
            height: adjustedHeight,
          },
        ]}
      >
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
            disabledInteraction={false}
            ListHeaderComponent={
              postData && (
                <AmityPostContentComponent
                  post={postData}
                  showedAllOptions
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
      <View
        style={styles.header}
        onLayout={(event: LayoutChangeEvent) => {
          const { height: layoutHeight } = event.nativeEvent.layout;
          setTopBarHeight(layoutHeight);
        }}
      >
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
      {renderFooterComponent}
    </SafeAreaView>
  );
};

export default memo(AmityPostDetailPage);
