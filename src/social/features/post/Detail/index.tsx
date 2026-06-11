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
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
} from 'react';
import { ComponentID, PageID } from '../../../enums';
import { TSearchItem, useAmityPage } from '../../../hooks';
import useAuth from '../../../../core/hooks/useAuth';
import { useStyles } from './styles';
import BackButtonIconElement from '../../../elements/BackButtonIconElement/BackButtonIconElement';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  PostRepository,
  SubscriptionLevels,
  getPostTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import AmityPostContentComponent from '../components/Content/Content';
import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '../../../enums/AmityPostContentComponentStyle';
import AmityPostCommentComponent from '../../comment/components/PostComment';

import { closeIcon } from '../../../../core/assets/icons/xml';
import { SvgXml } from 'react-native-svg';
import { IMentionPosition } from '../../../../core/types';
import NetInfo from '@react-native-community/netinfo';
import { useToast } from '../../../../core/stores/slices/toastSlice';
import MyAvatar from '../../../components/MyAvatar/MyAvatar';
import { MAX_MENTION_USERS } from '../../../../core/constants';

import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorComponent from '../../../components/ErrorComponent/ErrorComponent';
import { getSkeletonBackgrounColor } from '../../../../core/utils/color';
import ContentLoader, { Circle, Rect } from 'react-content-loader/native';
import { PostMenu } from '../../../components/PostMenu';
import useMention from '../../../hooks/useMention';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import {
  createComment,
  createReplyComment,
} from '../../../../core/legacy/comment';

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
  const componentId = ComponentID.WildCardComponent;
  // Web parity (CommentTray.canShowComposer): visitors cannot comment,
  // reply, react, or open the comment actions menu.
  const { isVisitorOrBot } = useAuth();
  const disabledInteraction = isVisitorOrBot;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isExcluded, themeStyles, accessibilityId } = useAmityPage({ pageId });
  const styles = useStyles(themeStyles);
  const { showToast, showCommentErrorToast } = useToast();
  const [postData, setPostData] = useState<Amity.Post<any>>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [replyUserName, setReplyUserName] = useState<string>('');
  const [replyCommentId, setReplyCommentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [mentionNames, setMentionNames] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );
  const [inputBarHeight, setInputBarHeight] = useState(0);

  const [showLivestreamEndPopup, setShowLivestreamEndPopup] = useState<boolean>(
    showEndPopup || false
  );

  // Restrict @mention list to community members when the post belongs to a
  // private community. postData.targetCommunity is populated after the post loads.
  const privateCommunityId =
    postData?.targetType === 'community' && !postData?.targetCommunity?.isPublic
      ? postData?.targetId
      : undefined;

  const { renderInput, renderSuggestions } = useMention({
    value: inputMessage,
    onChange: setInputMessage,
    communityId: privateCommunityId,
    setMentionUsers: (user: TSearchItem) => {
      setMentionNames((prev) => {
        if (prev.length >= MAX_MENTION_USERS) {
          Alert.alert(
            'Too many users mentioned',
            'You can only mention up to 30 users per post.',
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
    const uniqueMentionIds = [...new Set(mentionNames.map((item) => item.id))];
    if (uniqueMentionIds.length > MAX_MENTION_USERS) {
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
          uniqueMentionIds,
          mentionsPosition,
          'post'
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
          uniqueMentionIds,
          mentionsPosition,
          'post'
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
                  scrollEnabled: true,
                  placeholder: 'Say something nice...',
                  placeholderTextColor: themeStyles.colors.baseShade3,
                  style: [styles.input, { lineHeight: 20 }],
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
