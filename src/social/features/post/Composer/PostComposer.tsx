import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
} from 'react-native';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ComponentID,
  ElementID,
  ImageSizeState,
  PageID,
  mediaAttachment,
} from '../../../enums';
import {
  TSearchItem,
  useAmityPage,
  useRequestPermission,
  useUser,
  isModerator,
} from '../../../hooks';
import { useStyles } from './styles';
import {
  AmityPostComposerMode,
  AmityPostComposerPageType,
} from '../../../types';
import { IDisplayImage, IMentionPosition } from '../../../../core/types';
import CloseButtonIconElement from '../../../elements/CloseButtonIconElement/CloseButtonIconElement';
import { useNavigation } from '@react-navigation/native';
import uiSlice from '../../../../core/stores/slices/uiSlice';
import localVideoThumbnailSlice from '../../../../core/stores/slices/localVideoThumbnailSlice';
import { amityPostsFormatter } from '../../../../core/utils/post';
import useAuth from '../../../../core/hooks/useAuth';
import globalfeedSlice from '../../../../core/stores/slices/globalfeedSlice';
import { createPostToFeed, editPost } from '../../../../core/legacy/feed';
import TextKeyElement from '../../../elements/TextKeyElement/TextKeyElement';
import AmityMediaAttachmentComponent from '../components/MediaAttachment';
import AmityDetailedMediaAttachmentComponent from '../components/DetailedMediaAttachment';
import { useKeyboardStatus } from '../../../hooks';
import ImagePicker, {
  type Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { SelectedMediaComponent } from '../../../components/SelectedMediaComponent';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import {
  CommunityRepository,
  FileRepository,
  PostRepository,
  UserRepository,
} from '@amityco/ts-sdk-react-native';
import { useFile } from '../../../hooks';
import useMention from '../../../hooks/useMention';
import { getPostErrorMessage } from '../../../utils/errors';
import {
  ALERT,
  MAX_MENTION_USERS,
  MAXIMUM_POST_CHARACTERS,
} from '../../../../core/constants';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import { useUIKitDispatch } from '../../../../core/stores/store';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

const AmityPostComposerPage: FC<AmityPostComposerPageType> = ({
  mode,
  targetId,
  targetType,
  community,
  post,
}) => {
  useRequestPermission({
    onRequestPermissionFailed: () => {
      Linking.openSettings();
    },
    shouldCall: true,
  });
  const pageId = PageID.post_composer_page;
  const { AmityPostComposerPageBehavior } = useBehaviour();
  const { isExcluded, themeStyles, accessibilityId } = useAmityPage({ pageId });
  const styles = useStyles(themeStyles);
  const { getImage } = useFile();
  const isEditMode = mode === AmityPostComposerMode.EDIT;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isKeyboardShowing } = useKeyboardStatus();
  const [attachmentBarHeight, setAttachmentBarHeight] = useState(0);
  const { client } = useAuth();
  const dispatch = useUIKitDispatch();
  const { addPostToGlobalFeed, updateByPostId } = globalfeedSlice.actions;

  const currentUser = useUser((client as Amity.Client)?.userId || '');
  const isCommunityModerator = isModerator(currentUser?.roles);
  const { showToastMessage, hideToastMessage } = uiSlice.actions;
  const { setLocalVideoThumbnails } = localVideoThumbnailSlice.actions;
  const [inputMessage, setInputMessage] = useState<string>(
    (post?.data as Amity.ContentDataText)?.text ?? ''
  );
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );
  const [chosenMediaType, setChosenMediaType] = useState<mediaAttachment>(null);
  const [displayImages, setDisplayImages] = useState<IDisplayImage[]>([]);
  const [displayVideos, setDisplayVideos] = useState<IDisplayImage[]>([]);
  const [mentionUsers, setMentionUsers] = useState<TSearchItem[]>([]);
  const [isSwipeup, setIsSwipeup] = useState(true);
  const [deletedPostIds, setDeletedPostIds] = useState<string[]>([]);
  // PDT-5020: upload progress is tracked per media item, keyed by the item's
  // `source` url — the same shape as `imageErrors`/`videoErrors` below. A
  // single shared boolean was flipped back to false by whichever upload
  // finished first, so Post/Save unlocked while the remaining frames were
  // still in flight. Sources are unique across images and videos, so one set
  // covers both attachment types.
  const [uploadingSources, setUploadingSources] = useState<Set<string>>(
    new Set()
  );
  const isUploading = uploadingSources.size > 0;
  const [hasChangedAttachment, setHasChangedAttachment] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());

  // When community is not provided via props (e.g. PostTypeChoiceModal only
  // dispatches targetId/targetType), fetch it from targetId.
  const [fetchedCommunity, setFetchedCommunity] =
    useState<Amity.Community | null>(null);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    if (!community && targetType === 'community' && targetId) {
      unsub =
        CommunityRepository.getCommunity(
          targetId,
          ({ data, loading, error }) => {
            if (!loading && !error && data) setFetchedCommunity(data);
          }
        ) ?? undefined;
    }
    return () => unsub?.();
  }, [community, targetId, targetType]);

  const effectiveCommunity = community ?? fetchedCommunity;
  const privateCommunityId =
    !effectiveCommunity?.isPublic && effectiveCommunity?.communityId;
  const title = isEditMode
    ? 'Edit Post'
    : effectiveCommunity?.displayName ?? 'My Timeline';
  const isInputValid =
    !isUploading &&
    imageErrors.size === 0 &&
    videoErrors.size === 0 &&
    inputMessage.trim().length <= MAXIMUM_POST_CHARACTERS &&
    (inputMessage.trim().length > 0 ||
      displayImages.length > 0 ||
      displayVideos.length > 0) &&
    (displayImages.length <= 10 || displayVideos.length <= 10);

  const { renderInput, renderSuggestions } = useMention({
    value: inputMessage,
    onChange: setInputMessage,
    communityId: privateCommunityId,
    setMentionUsers: (user: TSearchItem) => {
      setMentionUsers((prev) => [...prev, user]);
    },
    setMentionPosition: (position: IMentionPosition) => {
      setMentionsPosition((prev) => [...prev, position]);
    },
    isMentionLimitReached: mentionUsers.length >= MAX_MENTION_USERS,
    onMentionLimitReached: () => {
      Alert.alert(
        ALERT.MENTION.TOO_MANY.TITLE,
        ALERT.MENTION.TOO_MANY.MESSAGE.replace('%s', String(MAX_MENTION_USERS)),
        [{ text: ALERT.ACTION.OK }]
      );
    },
  });

  // The edited post carries its own hydrated children: every post payload
  // ingests `postChildren` into the `post` cache (PAYLOAD2MODEL maps it to
  // 'post'), and postLinkedObject reads them straight back out. So the media is
  // known on the first frame, with no fetch — no second source to reconcile.
  const editChildren = post?.childrenPosts ?? [];

  // `childrenPosts` drops cache misses silently (postLinkedObject filters with
  // isNonNullable), so a short array means we cannot see every child. There is
  // no fallback fetch behind it, so treat that state as read-only: no
  // attachment bar, no Save.
  const editChildrenIncomplete =
    isEditMode && editChildren.length !== (post?.children?.length ?? 0);

  const checkIsEditValid = () => {
    // `type` in onPressPost is derived from displayImages/displayVideos, so
    // saving while a child is missing submits it as removed — `attachments: []`
    // and type 'text' strips the post's media outright. Nothing the user can do
    // in the composer makes an unrendered child safe to save, so key this on
    // completeness alone rather than on hasChangedAttachment.
    if (editChildrenIncomplete) return false;
    return (
      isInputValid &&
      (inputMessage !== (post?.data as Amity.ContentDataText)?.text ||
        hasChangedAttachment)
    );
  };

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

  // A child post's file is usually already in the SDK cache, where the linked
  // object exposes it synchronously (getImageInfo / getVideoInfo /
  // getVideoThumbnailInfo are `pullFromCache(['file','get', …])` over the very
  // ids we'd otherwise refetch). Use the cached `fileUrl` when it's there and
  // fall back to the round trip on a cache miss. `fileUrlWithSize` is just
  // `?size=`, so both branches produce the same url.
  const resolveFileUrl = useCallback(
    async (fileUrl: string | undefined, fileId: string | undefined) =>
      fileUrl
        ? FileRepository.fileUrlWithSize(fileUrl, ImageSizeState.full)
        : getImage({ fileId, imageSize: ImageSizeState.full }),
    [getImage]
  );

  const getPostInfo = useCallback(
    async (response: Amity.Post[]) => {
      try {
        const images: IDisplayImage[] = [];
        const videos: IDisplayImage[] = [];

        for (const item of response) {
          if (item?.dataType === 'image') {
            const fileId = (item as Amity.Post<'image'>)?.data?.fileId;
            // Dimensions for composer frame-ratio classification (REQ-003d).
            const imageInfo = item?.getImageInfo?.();
            const url = await resolveFileUrl(imageInfo?.fileUrl, fileId);
            images.push({
              url,
              fileId,
              fileName: fileId,
              // A hydrated child has no local pick behind it, so its identity
              // is the file it already is. Unique per child, stable for the
              // whole session, and never equal to a picker file name — so a
              // later pick is de-duplicated against the other staged picks
              // only, which is the most the picker can tell us (PDT-5040).
              localId: fileId ?? item.postId,
              isUploaded: true,
              postId: item.postId,
              width: imageInfo?.getWidth?.(),
              height: imageInfo?.getHeight?.(),
            });
          } else if (item?.dataType === 'video') {
            const videoData = (item as Amity.Post<'video'>)?.data;
            const fileId = videoData?.videoFileId?.original;
            const thumbnailFileId = videoData?.thumbnailFileId;
            // STORED dims + rotation; rotation is applied at classify time
            // (SelectedMediaComponent REQ-003d1 / AmityVideo REQ-SDK-002).
            const videoInfo = item?.getVideoInfo?.();
            const thumbnailInfo = item?.getVideoThumbnailInfo?.();
            // Settle the two urls independently: a missing or unreachable
            // thumbnail must not cost us the video itself. `Promise.all` would
            // reject the pair, abort this loop, and leave displayVideos empty
            // — which now also keeps Save disabled (see checkIsEditValid).
            const [urlResult, thumbNailResult] = await Promise.allSettled([
              resolveFileUrl(videoInfo?.fileUrl, fileId),
              resolveFileUrl(thumbnailInfo?.fileUrl, thumbnailFileId),
            ]);
            const url =
              urlResult.status === 'fulfilled' ? urlResult.value : undefined;
            const thumbNail =
              thumbNailResult.status === 'fulfilled'
                ? thumbNailResult.value
                : undefined;
            videos.push({
              url,
              fileId: fileId,
              fileName: fileId,
              localId: fileId ?? item.postId,
              isUploaded: true,
              thumbNail,
              postId: item.postId,
              width: videoInfo?.getWidth?.(),
              height: videoInfo?.getHeight?.(),
              rotation: videoInfo?.getRotation?.(),
            });
          }
        }

        if (images.length > 0) {
          setDisplayImages(images);
        }
        if (videos.length > 0) {
          setDisplayVideos(videos);
        }
      } catch (error) {
        console.log('error: ', error);
      }
    },
    [resolveFileUrl]
  );

  useEffect(() => {
    setDeletedPostIds([]);
    return () => setDeletedPostIds([]);
  }, []);

  // `post` comes from route params, so `editChildren` is reference-stable and
  // this hydrates once. The hasChangedAttachment guard is belt-and-braces:
  // getPostInfo assigns displayImages/displayVideos wholesale, so a re-run must
  // never be able to wipe media the user added.
  useEffect(() => {
    if (editChildren.length === 0 || hasChangedAttachment) return;
    getPostInfo(editChildren);
  }, [getPostInfo, post?.childrenPosts, hasChangedAttachment]);

  // Media type of the post being edited, read off the children's dataType —
  // the same signal the web UIKit feeds into useMediaAttachmentVisible.
  const editMediaType = useMemo(() => {
    if (editChildren.some((item) => item?.dataType === 'image'))
      return mediaAttachment.image;
    if (editChildren.some((item) => item?.dataType === 'video'))
      return mediaAttachment.video;
    return null;
  }, [post?.childrenPosts]);

  // The post's single media type, as every media entry point must see it: the
  // staged attachments when there are any, otherwise the type the edited post
  // already has. Read the display arrays rather than `chosenMediaType`, which
  // is assigned in an effect and so trails them by a render. Once the user has
  // cleared the attachments itself the post has no type again and all three
  // buttons come back, matching web.
  const activeMediaType =
    displayImages.length > 0
      ? mediaAttachment.image
      : displayVideos.length > 0
      ? mediaAttachment.video
      : hasChangedAttachment
      ? null
      : editMediaType;

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
      const parsedText = parsePostText(
        (post?.data as Amity.ContentDataText)?.text ?? '',
        users
      );
      setInputMessage(parsedText);
      return users;
    },
    [parsePostText, post?.data]
  );

  useEffect(() => {
    if (post?.mentionees?.length > 0) {
      const mentionPositions = getMentionPositions(
        (post?.data as Amity.ContentDataText)?.text ?? '',
        post.mentionees?.[0]?.userIds ?? []
      );
      getMentionUsers(post.mentionees?.[0]?.userIds ?? []);
      setMentionsPosition(mentionPositions);
    } else {
      setInputMessage((post?.data as Amity.ContentDataText)?.text ?? '');
    }
  }, [getMentionPositions, getMentionUsers, post]);

  const onPressClose = useCallback(() => {
    const routes = navigation.getState().routes;
    if (AmityPostComposerPageBehavior?.onPressPost) {
      AmityPostComposerPageBehavior.onPressPost();
    }
    if (routes[routes.length - 2].name === 'PostTargetSelection') {
      navigation.pop(2);
    } else navigation.pop();
  }, [navigation, AmityPostComposerPageBehavior]);

  const onClose = useCallback(() => {
    Alert.alert(
      'Discard this post',
      'The post will be permanently deleted. It cannot be undone',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => onPressClose(),
        },
      ]
    );
  }, [onPressClose]);

  const onPressPost = useCallback(async () => {
    Keyboard.dismiss();
    if (!isInputValid) {
      dispatch(
        showToastMessage({ toastMessage: 'Text field cannot be blank !' })
      );
      return;
    }
    dispatch(
      showToastMessage({
        toastMessage: 'Posting...',
        isLoadingToast: true,
      })
    );
    const mentionedUserIds =
      mentionUsers?.map((item) => item.id) ?? ([] as string[]);
    const files =
      chosenMediaType === mediaAttachment.image
        ? displayImages
        : chosenMediaType === mediaAttachment.video
        ? displayVideos
        : [];
    const fileIds = files.map((item) => item.fileId);
    const type: string =
      displayImages?.length > 0
        ? 'image'
        : displayVideos?.length > 0
        ? 'video'
        : 'text';
    try {
      let response;
      if (isEditMode) {
        if (deletedPostIds?.length > 0) {
          await Promise.allSettled(
            deletedPostIds.map((postId) =>
              PostRepository.deletePost(postId, false)
            )
          );
        }

        response = await editPost(
          post.postId,
          {
            text: replaceTriggerValues(inputMessage, ({ name }) => `@${name}`),
            fileIds: fileIds as string[],
          },
          type,
          mentionedUserIds.length > 0 ? mentionedUserIds : [],
          mentionsPosition
        );
      } else {
        response = await createPostToFeed(
          targetType,
          targetId,
          {
            text: replaceTriggerValues(inputMessage, ({ name }) => `@${name}`),
            fileIds: fileIds as string[],
          },
          type,
          mentionedUserIds.length > 0 ? mentionedUserIds : [],
          mentionsPosition
        );
      }
      if (!response) {
        const toastMessage = isEditMode
          ? 'Failed to edit post'
          : 'Failed to create post';
        dispatch(showToastMessage({ toastMessage: toastMessage }));
        onPressClose();
        return;
      }
      dispatch(hideToastMessage());
      // The server has no thumbnail for these videos until it finishes
      // transcoding, so hand the feed the frames the composer already decoded
      // to bridge that window (PDT-4904, web parity: LayoutProvider
      // videoThumbnail). Keyed by the uploaded original video's fileId, which
      // is what the created post exposes as `data.videoFileId.original`.
      if (type === 'video' && displayVideos.length > 0) {
        dispatch(
          setLocalVideoThumbnails({
            postId: response.postId,
            videos: displayVideos.map((item) => ({
              fileId: item.fileId ?? '',
              thumbnailUrl: item.thumbNail ?? '',
            })),
          })
        );
      }
      if (
        targetType === 'community' &&
        (effectiveCommunity?.postSetting === 'ADMIN_REVIEW_POST_REQUIRED' ||
          (effectiveCommunity as Record<string, any>)
            ?.needApprovalOnPostCreation) &&
        !isCommunityModerator
      ) {
        onPressClose();
        return Alert.alert(
          'Post submitted',
          'Your post has been submitted to the pending list. It will be reviewed by community moderator',
          [
            {
              text: 'OK',
            },
          ]
        );
      }
      const formattedPost = await amityPostsFormatter([response]);
      if (isEditMode) {
        const updatedPost = { ...post, ...formattedPost[0] };
        dispatch(
          updateByPostId({
            postId: post?.postId,
            postDetail: { ...updatedPost },
          })
        );
      } else {
        dispatch(addPostToGlobalFeed(formattedPost[0]));
      }
      onPressClose();
      return;
    } catch (error) {
      dispatch(hideToastMessage());
      const errorMessage = getPostErrorMessage(error, isEditMode);
      dispatch(showToastMessage({ toastMessage: errorMessage }));
    }
  }, [
    addPostToGlobalFeed,
    chosenMediaType,
    effectiveCommunity,
    deletedPostIds,
    dispatch,
    displayImages,
    displayVideos,
    hideToastMessage,
    inputMessage,
    isEditMode,
    isInputValid,
    isCommunityModerator,
    mentionUsers,
    mentionsPosition,
    onPressClose,
    setLocalVideoThumbnails,
    post,
    showToastMessage,
    targetId,
    targetType,
    updateByPostId,
  ]);

  let tEvents = [];
  const onSwipe = useCallback(
    (touchEvent: number[]) => {
      const swipeUp = touchEvent[0] > touchEvent[touchEvent.length - 1];
      const swipeDown = touchEvent[0] < touchEvent[touchEvent.length - 1];
      setIsSwipeup((prev) => {
        if (swipeUp && !isKeyboardShowing) return true;
        if (swipeDown) return false;
        return prev;
      });
    },
    [isKeyboardShowing]
  );

  useEffect(() => {
    isKeyboardShowing && setIsSwipeup(false);
  }, [isKeyboardShowing]);
  const shouldShowDetailAttachment = !isKeyboardShowing && isSwipeup;

  const processMedia = useCallback((mediaUrls: string[]) => {
    if (!mediaUrls?.length) return null;
    const mediaObject: IDisplayImage[] = mediaUrls.map((url: string) => {
      const fileName: string = url.substring(url.lastIndexOf('/') + 1);
      return {
        url: url,
        fileName: fileName,
        // Camera captures land on a freshly generated temp path, so the path
        // itself is the identity: unique per shot, and stable once the upload
        // rewrites `url` to the remote one (PDT-5003). Deliberately no
        // `localFileName` — two shots of the same scene are two distinct
        // attachments and must never de-duplicate against each other, nor
        // against a library pick that happens to share a basename (PDT-5040).
        localId: url,
        fileId: '',
        isUploaded: false,
      };
    });
    return mediaObject;
  }, []);

  useEffect(() => {
    if (displayImages?.length) return setChosenMediaType(mediaAttachment.image);
    if (displayVideos?.length) return setChosenMediaType(mediaAttachment.video);
    return setChosenMediaType(null);
  }, [displayImages?.length, displayVideos?.length]);

  const pickCamera = useCallback(
    async (mediaType: 'mixed' | 'photo' | 'video') => {
      if (mediaType === 'photo' && displayImages.length === 10)
        return Alert.alert(
          'Maximum upload limit reached',
          "You've reached the upload limit of 10 images. Any additional images will not be saved."
        );
      if (mediaType === 'video' && displayVideos.length === 10)
        return Alert.alert(
          'Maximum upload limit reached',
          "You've reached the upload limit of 10 videos. Any additional videos will not be saved."
        );
      try {
        const result: ImagePicker.ImagePickerResponse = await launchCamera({
          mediaType: mediaType,
          quality: 1,
          presentationStyle: 'fullScreen',
          videoQuality: 'high',
        });
        if (
          result.assets &&
          result.assets.length > 0 &&
          result.assets[0] !== null &&
          result.assets[0]
        ) {
          if (result.assets[0].type?.includes('image')) {
            const imagesArr: string[] = [];
            imagesArr.push(result.assets[0].uri as string);
            const mediaOj = processMedia(imagesArr);
            setDisplayImages((prev) => [...prev, ...mediaOj]);
          } else {
            const selectedVideos: Asset[] = result.assets;
            const imageUriArr: string[] = selectedVideos.map(
              (item: Asset) => item.uri
            ) as string[];
            const videosArr: string[] = [];
            const totalVideos: string[] = videosArr.concat(imageUriArr);
            const mediaOj = processMedia(totalVideos);
            setDisplayVideos((prev) => [...prev, ...mediaOj]);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    [displayImages.length, displayVideos.length, processMedia]
  );
  const onPressCamera = useCallback(async () => {
    // The camera button is always rendered — unlike photo/video, neither
    // attachment bar hides it on `chosenMediaType` — so this is the one entry
    // point that must decide the capture type itself. Keying it on the staged
    // arrays alone offered both types while an edited post's media was still
    // hydrating, which is how a video could be shot onto an image post.
    if (activeMediaType === mediaAttachment.image) return pickCamera('photo');
    if (activeMediaType === mediaAttachment.video) return pickCamera('video');
    if (Platform.OS === 'ios') return pickCamera('mixed');
    Alert.alert('Open Camera', null, [
      { text: 'Photo', onPress: async () => pickCamera('photo') },
      { text: 'Video', onPress: async () => pickCamera('video') },
    ]);
  }, [activeMediaType, pickCamera]);

  // Open the native OS camera roll (matches the web UIKit's native file
  // picker). Appends the picked media, de-duplicating by uri and capping at 10.
  const pickFromLibrary = useCallback(
    async (mediaType: 'photo' | 'video') => {
      const isPhoto = mediaType === 'photo';
      // A post holds one media type. The bar hides the mismatched button, but
      // guard the entry point too so a tap landing before the button updates
      // can't replace the existing attachments with the other type.
      const pickedType = isPhoto
        ? mediaAttachment.image
        : mediaAttachment.video;
      if (activeMediaType && activeMediaType !== pickedType) return;
      const current = isPhoto ? displayImages.length : displayVideos.length;
      if (current >= 10)
        return Alert.alert(
          'Maximum upload limit reached',
          `You've reached the upload limit of 10 ${
            isPhoto ? 'images' : 'videos'
          }. Any additional ${isPhoto ? 'images' : 'videos'} will not be saved.`
        );
      const result: ImagePicker.ImagePickerResponse = await launchImageLibrary({
        mediaType,
        quality: 1,
        selectionLimit: 10 - current,
      });
      if (result.didCancel || !result.assets?.length) return;

      const setter = isPhoto ? setDisplayImages : setDisplayVideos;
      setter((prev) => {
        // Silently drop duplicates, matching the web UIKit (which dedups by
        // file name) — no toast, no alert, and the already-staged copy is left
        // exactly where it is, so the remaining picks keep their order
        // (PDT-5040).
        //
        // Compare against the LOCAL identity, never against `fileName`: the
        // moment an item finishes uploading, handleOnFinishImage rewrites its
        // fileName to the server's `file[0].attributes.name` (and getPostInfo
        // hydrates edit-mode entries with the fileId), so a set built from
        // fileName holds server-side names while the incoming assets carry
        // picker names. Nothing ever matched and every re-pick slipped through
        // as a duplicate frame. `localId`/`localFileName` are assigned at pick
        // time and preserved across the upload, so they still line up here.
        const seenIds = new Set(
          prev.map((m) => m.localId).filter(Boolean) as string[]
        );
        const seenNames = new Set(
          prev.map((m) => m.localFileName).filter(Boolean) as string[]
        );
        const additions: IDisplayImage[] = [];
        // iOS video is the one pick whose dims cannot be trusted: the picker
        // reports the track's stored `naturalSize` with no rotation alongside
        // it, so a portrait iPhone clip arrives as 1920×1080 and would
        // classify the frame 16:9 (PDT-4904). Images on both platforms, and
        // Android video (its extractor swaps w/h on 90°/270°), are already
        // display-oriented and unaffected. With no rotation to correct the iOS
        // value by, carry nothing and let SelectedMediaComponent measure the
        // generated thumbnail, which is a rendered frame.
        const isIosVideoDimsUnusable = !isPhoto && Platform.OS === 'ios';
        for (const asset of result.assets ?? []) {
          if (!asset.uri) continue;
          const fileName =
            asset.fileName ??
            asset.uri.substring(asset.uri.lastIndexOf('/') + 1);
          // `asset.id` is the library's own identifier for the asset (PHAsset
          // localIdentifier / MediaStore id) and is the one key that survives
          // the picker copying the pick to a new temp uri on every pick. It is
          // not populated by every picker configuration, so fall back to the
          // file name and keep the name as a second key either way — that is
          // what catches a re-pick when no id came back.
          const localId = asset.id ?? fileName;
          if (seenIds.has(localId) || seenNames.has(fileName)) continue; // duplicate → silently drop
          seenIds.add(localId);
          seenNames.add(fileName);
          additions.push({
            url: asset.uri,
            fileName,
            localId,
            localFileName: fileName,
            fileId: '',
            isUploaded: false,
            width: isIosVideoDimsUnusable ? undefined : asset.width,
            height: isIosVideoDimsUnusable ? undefined : asset.height,
          });
        }
        const updated = [...prev, ...additions];
        return updated.length > 10 ? updated.slice(0, 10) : updated;
      });
    },
    [activeMediaType, displayImages.length, displayVideos.length]
  );

  const onPressImage = useCallback(
    () => pickFromLibrary('photo'),
    [pickFromLibrary]
  );

  const onPressVideo = useCallback(
    () => pickFromLibrary('video'),
    [pickFromLibrary]
  );

  // Children report their own upload start/end keyed by `source`, and a child
  // that unmounts mid-upload (frame removed while still uploading) clears its
  // own entry from its cleanup — otherwise the set would never empty and Post
  // would stay disabled forever (PDT-5020).
  const handleUploadingChange = useCallback(
    (uploading: boolean, source: string) => {
      setUploadingSources((prev) => {
        if (uploading === prev.has(source)) return prev;
        const newSet = new Set(prev);
        if (uploading) {
          newSet.add(source);
        } else {
          newSet.delete(source);
        }
        return newSet;
      });
    },
    []
  );

  const handleImageUploadError = useCallback(
    (hasError: boolean, source: string) => {
      setImageErrors((prev) => {
        const newSet = new Set(prev);
        if (hasError) {
          newSet.add(source);
        } else {
          newSet.delete(source);
        }
        return newSet;
      });
    },
    []
  );

  const handleVideoUploadError = useCallback(
    (hasError: boolean, source: string) => {
      setVideoErrors((prev) => {
        const newSet = new Set(prev);
        if (hasError) {
          newSet.add(source);
        } else {
          newSet.delete(source);
        }
        return newSet;
      });
    },
    []
  );

  const handleOnCloseImage = useCallback(
    (originalPath: string, _, postId: string) => {
      setHasChangedAttachment(true);
      if (postId) setDeletedPostIds((prev) => [...prev, postId]);
      setImageErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(originalPath);
        return newSet;
      });
      setDisplayImages((prevData) => {
        const newData = prevData.filter(
          (item: IDisplayImage) => item.url !== originalPath
        );
        return newData;
      });
    },
    []
  );
  const handleOnCloseVideo = useCallback(
    (originalPath: string, _, postId: string) => {
      setHasChangedAttachment(true);
      if (postId) setDeletedPostIds((prev) => [...prev, postId]);
      setVideoErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(originalPath);
        return newSet;
      });
      setDisplayVideos((prevData) => {
        const newData = prevData.filter(
          (item: IDisplayImage) => item.url !== originalPath
        );
        return newData;
      });
    },
    []
  );
  // Route a finished upload back to the entry it actually belongs to, by the
  // local path the child was mounted with (PDT-5003).
  //
  // The child hands us both a positional `index` and `originalPath`. The index
  // is the array position the frame was RENDERED at when the upload started —
  // LoadingVideo goes further and memoises its uploader on `[source]` alone, so
  // it freezes the index of the render where the source last changed. Writing
  // `newData[index]` therefore lands on whatever now sits at that position: a
  // frame removed, an upload retried after the array grew, or a slow upload
  // finishing after its neighbours moved all put one file's remote url on
  // another file's entry — which is what QA saw as an already-loaded image
  // repainting with a different picture once the network came back. Matching on
  // `originalPath` is exact: a not-yet-uploaded entry's `url` IS the local path
  // its child was handed, and the picker de-duplication guarantees those are
  // unique across the array.
  //
  // No match means the entry is gone (closed mid-upload) or already finished —
  // leave the array alone rather than resurrecting or double-writing it.
  const applyFinishedUpload = useCallback(
    (
      prevData: IDisplayImage[],
      originalPath: string,
      patch: Partial<IDisplayImage>
    ) => {
      const targetIndex = prevData.findIndex(
        (item) => item.url === originalPath
      );
      if (targetIndex === -1) return prevData;
      const newData = [...prevData];
      // Merge rather than replace: `localId`/`localFileName` are what the next
      // pick de-duplicates against (PDT-5040) and what the carousel keys its
      // frames by, and the picker's width/height still classify the frame
      // ratio — a wholesale replacement dropped all of them.
      newData[targetIndex] = { ...newData[targetIndex], ...patch };
      return newData;
    },
    []
  );

  const handleOnFinishImage = useCallback(
    (
      fileId: string,
      fileUrl: string,
      fileName: string,
      _index: number,
      originalPath: string
    ) => {
      setHasChangedAttachment(true);
      setDisplayImages((prevData) =>
        applyFinishedUpload(prevData, originalPath, {
          url: fileUrl,
          fileId: fileId,
          fileName: fileName,
          isUploaded: true,
        })
      );
    },
    [applyFinishedUpload]
  );
  const handleOnFinishVideo = useCallback(
    (
      fileId: string,
      fileUrl: string,
      fileName: string,
      _index: number,
      originalPath: string,
      thumbnail: string
    ) => {
      setHasChangedAttachment(true);
      setDisplayVideos((prevData) =>
        applyFinishedUpload(prevData, originalPath, {
          url: fileUrl,
          fileId: fileId,
          fileName: fileName,
          isUploaded: true,
          thumbNail: thumbnail,
        })
      );
    },
    [applyFinishedUpload]
  );

  // PDT-4310 / PDT-4312: at the 10-attachment cap the camera + gallery icons
  // are disabled until the user removes a frame.
  const isMediaCapReached =
    displayImages.length >= 10 || displayVideos.length >= 10;

  const renderDetailedAttachment = useCallback(() => {
    if (editChildrenIncomplete) return null;
    if (shouldShowDetailAttachment) {
      return (
        <AmityDetailedMediaAttachmentComponent
          onPressCamera={onPressCamera}
          onPressImage={onPressImage}
          onPressVideo={onPressVideo}
          chosenMediaType={activeMediaType}
          onHeightChange={setAttachmentBarHeight}
          disabled={isMediaCapReached}
        />
      );
    }
    return (
      <AmityMediaAttachmentComponent
        onPressCamera={onPressCamera}
        onPressImage={onPressImage}
        onPressVideo={onPressVideo}
        chosenMediaType={activeMediaType}
        onHeightChange={setAttachmentBarHeight}
        disabled={isMediaCapReached}
      />
    );
  }, [
    activeMediaType,
    editChildrenIncomplete,
    isMediaCapReached,
    onPressCamera,
    onPressImage,
    onPressVideo,
    shouldShowDetailAttachment,
  ]);

  if (isExcluded) return null;
  return (
    <SafeAreaView
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onClose} hitSlop={20}>
          <CloseButtonIconElement pageID={pageId} style={styles.closeBtn} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={onPressPost}
          disabled={!isInputValid || !checkIsEditValid()}
        >
          {isEditMode ? (
            <Text
              style={[
                styles.postBtnText,
                checkIsEditValid() && styles.activePostBtn,
              ]}
            >
              Save
            </Text>
          ) : (
            <TextKeyElement
              pageID={pageId}
              componentID={ComponentID.WildCardComponent}
              elementID={ElementID.create_new_post_button}
              style={[styles.postBtnText, isInputValid && styles.activePostBtn]}
            />
          )}
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {renderInput({
            multiline: true,
            placeholder: "What's going on...",
            placeholderTextColor: themeStyles.colors.baseShade3,
            style: styles.input,
          })}
          <View style={styles.imageContainer}>
            {displayImages.length > 0 && (
              <SelectedMediaComponent
                mediaType="image"
                media={displayImages}
                onClose={handleOnCloseImage}
                onLoadFinish={handleOnFinishImage}
                onUploadError={handleImageUploadError}
                isEditMode={isEditMode}
                onUploadingChange={handleUploadingChange}
              />
            )}
            {displayVideos.length > 0 && (
              <SelectedMediaComponent
                mediaType="video"
                media={displayVideos}
                onClose={handleOnCloseVideo}
                onLoadFinish={handleOnFinishVideo}
                onUploadError={handleVideoUploadError}
                isEditMode={isEditMode}
                onUploadingChange={handleUploadingChange}
              />
            )}
          </View>
        </ScrollView>
        {renderSuggestions({ type: 'post' })}
        <View
          style={{ zIndex: 200, minHeight: attachmentBarHeight }}
          onTouchStart={() => {
            tEvents = [];
          }}
          onTouchMove={(a) => {
            tEvents.push(a.nativeEvent.locationY);
            onSwipe(tEvents);
          }}
        >
          {renderDetailedAttachment()}
        </View>
      </KeyboardAvoidingView>
      <StatusBar backgroundColor={themeStyles.colors.background} />
    </SafeAreaView>
  );
};

export default memo(AmityPostComposerPage);
