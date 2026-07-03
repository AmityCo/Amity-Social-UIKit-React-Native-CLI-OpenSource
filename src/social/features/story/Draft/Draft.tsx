import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { FC, useCallback, useState, useEffect, memo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import {
  leftLongArrow,
  rightLongArrow,
  storyHyperLinkIcon,
} from '../../../../core/assets/icons/xml';
import { SvgXml } from 'react-native-svg';
import { useStyles } from './styles';
import {
  CommunityRepository,
  StoryRepository,
} from '@amityco/ts-sdk-react-native';
import {
  ComponentID,
  ElementID,
  PageID,
  StoryType,
  ImageSizeState,
} from '../../../enums';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';
import { useConfigImageUri } from '../../../hooks/useConfigImageUri';
import HyperlinkConfig from './components/HyperLinkConfig';
import { IAmityDraftStoryPage } from '../../../types';
import { useFile } from '../../../hooks/useFile';
import { getMediaTypeFromUrl } from '../../../../core/utils/url';
import { LoadingOverlay } from '../../../components/legacy/LoadingOverlay';
import mime from 'mime';
import { appendFileToFormData } from '../../../../core/utils/fileUpload';
import { useToast } from '../../../../core/stores/slices/toastSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

const AmityDraftStoryPage: FC<IAmityDraftStoryPage> = ({
  targetId,
  targetType,
  mediaType,
  onCreateStory,
  onDiscardStory,
}) => {
  const type = getMediaTypeFromUrl(mediaType.uri);
  const styles = useStyles();
  const { getImage } = useFile();
  const [imageDisplayMode, setImageDisplayMode] =
    useState<Amity.ImageDisplayMode>('fit');
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [communityAvatarUrl, setCommunityAvatarUrl] = useState<string | null>(
    null
  );
  const [hyperlink, setHyperlink] = useState<Amity.StoryItem[]>(undefined);
  const [loading, setLoading] = useState(false);
  const theme = useTheme() as MyMD3Theme;
  const aspectRatioIcon = useConfigImageUri({
    configPath: {
      page: PageID.CreateStoryPage,
      component: ComponentID.WildCardComponent,
      element: ElementID.AspectRatioBtn,
    },
    configKey: 'aspect_ratio_icon',
  });
  const hyperLinkIcon = useConfigImageUri({
    configPath: {
      page: PageID.CreateStoryPage,
      component: ComponentID.WildCardComponent,
      element: ElementID.StoryHyperLinkBtn,
    },
    configKey: 'hyperlink_button_icon',
  });

  const { showToast } = useToast();

  useEffect(() => {
    if (!targetId || targetType !== 'community')
      return setCommunityAvatarUrl(null);
    CommunityRepository.getCommunity(
      targetId,
      async ({ error, loading: isLoading, data }) => {
        if (error) return;
        if (!isLoading) {
          const image = await getImage({
            fileId: data.avatarFileId,
            imageSize: ImageSizeState.small,
            type: 'community',
          });
          setCommunityAvatarUrl(image ?? null);
        }
      }
    )();
  }, [getImage, targetId, targetType]);

  const onPressBack = useCallback(() => {
    Alert.alert(
      'Discard this story?',
      'The story will be permanently deleted. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            onDiscardStory();
          },
        },
      ]
    );
  }, [onDiscardStory]);

  const onPressAspectRatio = useCallback(() => {
    setImageDisplayMode((prev) => (prev === 'fit' ? 'fill' : 'fit'));
  }, []);

  const onPressHyperLink = useCallback(() => {
    setIsVisibleModal(true);
  }, []);

  const onPressShareStory = useCallback(async () => {
    const formData = new FormData();
    const isImage = type === StoryType.image;
    const mimeType =
      mime.getType(mediaType.uri) ?? (isImage ? 'image/jpeg' : 'video/mp4');

    await appendFileToFormData(
      formData,
      'files',
      mediaType.uri,
      mediaType.name,
      mimeType
    );

    try {
      setLoading(true);
      if (type === StoryType.image) {
        await StoryRepository.createImageStory(
          'community',
          targetId,
          formData,
          {},
          imageDisplayMode,
          hyperlink
        );
      } else {
        await StoryRepository.createVideoStory(
          'community',
          targetId,
          formData,
          {},
          hyperlink
        );
      }

      showToast({ message: 'Successfully shared story.', type: 'success' });
    } catch (error) {
      showToast({
        message: 'Failed to share story. Please try again.',
        type: 'informative',
      });
    } finally {
      setLoading(false);
      onCreateStory();
    }
  }, [
    hyperlink,
    imageDisplayMode,
    mediaType,
    onCreateStory,
    showToast,
    targetId,
    type,
  ]);

  const onHyperLinkSubmit = useCallback(
    (item?: { url: string; customText: string }) => {
      if (!item) {
        setHyperlink(undefined);
        setIsVisibleModal(false);
        return;
      }
      const storyItem: Amity.StoryItem = {
        data: item,
        type: 'hyperlink' as Amity.StoryItemType.Hyperlink,
      };
      setHyperlink([storyItem]);
      setIsVisibleModal(false);
    },
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        {type === StoryType.image ? (
          <>
            {imageDisplayMode !== 'fill' && (
              <Image
                source={{ uri: mediaType.uri }}
                style={styles.blurredBackground}
                resizeMode="cover"
                blurRadius={20}
              />
            )}
            <Image
              source={{ uri: mediaType.uri }}
              style={styles.image}
              resizeMode={imageDisplayMode === 'fill' ? 'cover' : 'contain'}
            />
          </>
        ) : (
          <Video
            paused={loading}
            repeat
            source={{ uri: mediaType.uri }}
            style={styles.image}
            resizeMode={imageDisplayMode === 'fill' ? 'cover' : 'contain'}
          />
        )}
        {imageDisplayMode === 'fill' && (
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'transparent', 'rgba(0, 0, 0, 0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.storyGradient}
          />
        )}
      </View>
      {hyperlink?.length > 0 && (
        <TouchableOpacity
          style={styles.hyperlinkContainer}
          onPress={onPressHyperLink}
        >
          <SvgXml xml={storyHyperLinkIcon('blue')} width="25" height="25" />
          <Text style={styles.hyperlinkText}>
            {(hyperlink[0]?.data?.customText?.length ?? 0) === 0
              ? hyperlink[0]?.data?.url
              : hyperlink[0]?.data?.customText}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.shareStoryBtn}
        onPress={onPressShareStory}
      >
        <Image
          source={
            communityAvatarUrl
              ? { uri: communityAvatarUrl }
              : require('../../../../core/assets/images/communityAvatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.shareStoryTxt}>Share story</Text>
        <SvgXml
          xml={rightLongArrow(theme.colors.baseShade2)}
          width={16}
          height={16}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.backBtn} onPress={onPressBack}>
        <SvgXml xml={leftLongArrow('white')} width={32} height={32} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.aspectRatioBtn}
        onPress={onPressAspectRatio}
      >
        <Image source={aspectRatioIcon} style={styles.aspectRationIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.hyperLinkBtn} onPress={onPressHyperLink}>
        <Image source={hyperLinkIcon} style={styles.hyperLinkIcon} />
      </TouchableOpacity>
      <HyperlinkConfig
        isVisibleModal={isVisibleModal}
        setIsVisibleModal={setIsVisibleModal}
        onHyperLinkSubmit={onHyperLinkSubmit}
        hyperlinkItem={hyperlink?.[0]?.data}
      />
      <LoadingOverlay isLoading={loading} />
    </SafeAreaView>
  );
};

export default memo(AmityDraftStoryPage);
