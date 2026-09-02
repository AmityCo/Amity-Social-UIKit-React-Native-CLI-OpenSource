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
import { amityPostsFormatter } from '../../../../core/utils/post';
import useAuth from '../../../../core/hooks/useAuth';
import globalfeedSlice from '../../../../core/stores/slices/globalfeedSlice';
import { createPostToFeed, editPost } from '../../../../core/legacy/feed';
import { usePostByIds } from '../../../../core/hooks/usePostByIds';
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
  const [isUploading, setIsUploading] = useState(false);
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

  const checkIsEditValid = () => {
    // `type` in onPressPost is derived from displayImages/displayVideos, which
    // only fill once the children's file urls resolve. Saving before then
    // submits type 'text' with `attachments: []` and strips the post's media,
    // so hold Save back while the post has children but no loaded attachments
    // — unless the user removed them itself, which sets hasChangedAttachment.
    if (
      isEditMode &&
      (post?.children?.length ?? 0) > 0 &&
      !hasChangedAttachment &&
      displayImages.length === 0 &&
      displayVideos.length === 0
    )
      return false;
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

  // Load the edited post's child media the same way the web UIKit does
  // (usePostByIds → batch getPostByIds), instead of the racy per-id fetch.
  const { posts: childrenPosts, settled: childrenSettled } = usePostByIds(
    post?.children ?? []
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
            const [url, thumbNail] = await Promise.all([
              resolveFileUrl(videoInfo?.fileUrl, fileId),
              resolveFileUrl(thumbnailInfo?.fileUrl, thumbnailFileId),
            ]);
            videos.push({
              url,
              fileId: fileId,
              fileName: fileId,
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

  // Source for hydrating the existing attachments. Prefer the fetched children;
  // otherwise use the post's own `childrenPosts` — but only when it holds every
  // child, since that field silently drops cache misses and a partial set would
  // render only some of the frames.
  const editChildren = useMemo(() => {
    if (childrenPosts.length > 0) return childrenPosts;
    const cached = post?.childrenPosts ?? [];
    return cached.length === (post?.children?.length ?? 0) ? cached : [];
  }, [childrenPosts, post?.children?.length, post?.childrenPosts]);

  // getPostInfo replaces displayImages/displayVideos wholesale, so re-running it
  // (cache-derived set first, fetched set after) must not wipe what the user
  // added in between — but the fetched set does need to be able to correct a
  // cache-derived one, so gate on the user's own edits rather than latching
  // after the first pass.
  useEffect(() => {
    if (editChildren.length === 0 || hasChangedAttachment) return;
    getPostInfo(editChildren);
  }, [getPostInfo, editChildren, hasChangedAttachment]);

  // Media type of the post being edited, read straight off the children's
  // dataType — the same signal the web UIKit feeds into
  // useMediaAttachmentVisible.
  //
  // The linked post already carries its hydrated `childrenPosts`, so on the
  // usual path (Edit opened from a post whose media just rendered) the type is
  // known on the first frame with no fetch. That field is a snapshot of
  // `pullFromCache` with the misses filtered out, though — on a cache miss it
  // is `[]` while `children` is not — so fall back to the fetched children.
  const editMediaType = useMemo(() => {
    const cached = post?.childrenPosts ?? [];
    const source = childrenPosts.length > 0 ? childrenPosts : cached;
    if (source.some((item) => item?.dataType === 'image'))
      return mediaAttachment.image;
    if (source.some((item) => item?.dataType === 'video'))
      return mediaAttachment.video;
    return null;
  }, [childrenPosts, post?.childrenPosts]);

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
    if (displayImages.length > 0) return pickCamera('photo');
    if (displayVideos.length > 0) return pickCamera('video');
    if (Platform.OS === 'ios') return pickCamera('mixed');
    Alert.alert('Open Camera', null, [
      { text: 'Photo', onPress: async () => pickCamera('photo') },
      { text: 'Video', onPress: async () => pickCamera('video') },
    ]);
  }, [displayImages.length, displayVideos.length, pickCamera]);

  // Open the native OS camera roll (matches the web UIKit's native file
  // picker). Appends the picked media, de-duplicating by uri and capping at 10.
  const pickFromLibrary = useCallback(
    async (mediaType: 'photo' | 'video') => {
      const isPhoto = mediaType === 'photo';
      // A post holds one media type. The attachment bar hides the mismatched
      // button once `chosenMediaType` is set, but in edit mode that only
      // happens after the post's children have loaded — guard the gap so a
      // fast tap can't replace the existing attachments with the other type.
      if (isPhoto ? displayVideos.length > 0 : displayImages.length > 0) return;
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
        // file name). The picker copies each pick to a fresh temp uri, so uri
        // is not stable across picks — the original `fileName` is.
        const seen = new Set(prev.map((m) => m.fileName));
        const additions: IDisplayImage[] = [];
        // The picker's dims are display-oriented for images on both platforms
        // and for Android video (its extractor swaps w/h on 90°/270°), but an
        // iOS video reports the track's stored `naturalSize` with no rotation
        // alongside it — a portrait iPhone clip arrives as 1920×1080 and would
        // classify the frame 16:9 (PDT-4904). With no rotation to correct it
        // by, carry nothing and let SelectedMediaComponent measure the
        // generated thumbnail, which is already display-oriented.
        const carryDims = isPhoto || Platform.OS !== 'ios';
        for (const asset of result.assets ?? []) {
          if (!asset.uri) continue;
          const fileName =
            asset.fileName ??
            asset.uri.substring(asset.uri.lastIndexOf('/') + 1);
          if (seen.has(fileName)) continue; // duplicate → silently drop
          seen.add(fileName);
          additions.push({
            url: asset.uri,
            fileName,
            fileId: '',
            isUploaded: false,
            width: carryDims ? asset.width : undefined,
            height: carryDims ? asset.height : undefined,
          });
        }
        const updated = [...prev, ...additions];
        return updated.length > 10 ? updated.slice(0, 10) : updated;
      });
    },
    [displayImages.length, displayVideos.length]
  );

  const onPressImage = useCallback(
    () => pickFromLibrary('photo'),
    [pickFromLibrary]
  );

  const onPressVideo = useCallback(
    () => pickFromLibrary('video'),
    [pickFromLibrary]
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
  const handleOnFinishImage = useCallback(
    (fileId: string, fileUrl: string, fileName: string, index: number) => {
      setHasChangedAttachment(true);
      const imageObject: IDisplayImage = {
        url: fileUrl,
        fileId: fileId,
        fileName: fileName,
        isUploaded: true,
      };
      setDisplayImages((prevData) => {
        const newData = [...prevData];
        newData[index] = imageObject;
        return newData;
      });
    },
    []
  );
  const handleOnFinishVideo = useCallback(
    (
      fileId: string,
      fileUrl: string,
      fileName: string,
      index: number,
      _,
      thumbnail: string
    ) => {
      setHasChangedAttachment(true);
      const imageObject: IDisplayImage = {
        url: fileUrl,
        fileId: fileId,
        fileName: fileName,
        isUploaded: true,
        thumbNail: thumbnail,
      };
      setDisplayVideos((prevData) => {
        const newData = [...prevData];
        newData[index] = imageObject;
        return newData;
      });
    },
    []
  );

  // PDT-4310 / PDT-4312: at the 10-attachment cap the camera + gallery icons
  // are disabled until the user removes a frame.
  const isMediaCapReached =
    displayImages.length >= 10 || displayVideos.length >= 10;

  // Hold the bar back until the edited post's media type is known, so it
  // appears once with the right buttons (a video post opens straight to
  // camera + video) instead of briefly offering the mismatched one.
  const isEditMediaPending =
    isEditMode &&
    (post?.children?.length ?? 0) > 0 &&
    editMediaType === null &&
    !childrenSettled;

  // Until the picked media lands in displayImages/displayVideos, fall back to
  // the type derived from the children. Once the user has changed the
  // attachments, `chosenMediaType` alone is authoritative — otherwise clearing
  // every attachment would still be locked to the original post's type.
  const attachmentMediaType =
    chosenMediaType ?? (hasChangedAttachment ? null : editMediaType);

  const renderDetailedAttachment = useCallback(() => {
    if (isEditMediaPending) return null;
    if (shouldShowDetailAttachment) {
      return (
        <AmityDetailedMediaAttachmentComponent
          onPressCamera={onPressCamera}
          onPressImage={onPressImage}
          onPressVideo={onPressVideo}
          chosenMediaType={attachmentMediaType}
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
        chosenMediaType={attachmentMediaType}
        onHeightChange={setAttachmentBarHeight}
        disabled={isMediaCapReached}
      />
    );
  }, [
    attachmentMediaType,
    isEditMediaPending,
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
                setIsUploading={setIsUploading}
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
                setIsUploading={setIsUploading}
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
