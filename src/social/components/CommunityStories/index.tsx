import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useStyles } from './styles';
import { useStory } from '../../hooks/useStory';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import {
  errorIcon,
  storyCircleCreatePlusIcon,
  storyRing,
} from '../../../core/assets/icons/xml';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { useFile } from '../../hooks/useFile';
import { ImageSizeState } from '../../enums/imageSizeState';
import { useStoryPermission } from '../../hooks/useStoryPermission';
import useConfig from '../../hooks/useConfig';
import { ComponentID, ElementID, PageID } from '../../enums';
import Modal from 'react-native-modalbox';
import AmityViewStoryPage from '../../features/story/View/View';
import { Typography } from '../../../core/components/Typography/Typography';

interface ICommunityStories {
  communityId: string;
  community: Amity.Community;
}

const CommunityStories = ({ communityId, community }: ICommunityStories) => {
  const navigation =
    useNavigation() as NativeStackNavigationProp<RootStackParamList>;
  const styles = useStyles();
  const { getUiKitConfig } = useConfig();
  const { hasStoryPermission } = useStoryPermission(communityId);
  const { getStoryTarget, storyTarget, stories, getStories } = useStory();
  const { getImage } = useFile();
  const [avatarUrl, setAvatarUrl] = useState(undefined);
  const [viewStory, setViewStory] = useState(false);
  const shouldRestoreStory = useRef(false);
  const storyRingColor: string[] =
    hasStoryPermission && storyTarget?.failedStoriesCount > 0
      ? ['#DE1029', '#DE1029']
      : storyTarget?.hasUnseen
      ? (getUiKitConfig({
          page: PageID.StoryPage,
          component: ComponentID.StoryTab,
          element: ElementID.StoryRing,
        })?.progress_color as string[]) ?? ['#e2e2e2', '#e2e2e2']
      : stories.length > 0
      ? ['#e2e2e2', '#ffffff']
      : ['#ffffff', '#ffffff'];

  useEffect(() => {
    (async () => {
      const avatarImage = await getImage({
        fileId: community?.avatarFileId,
        imageSize: ImageSizeState.small,
        type: 'community',
      });
      setAvatarUrl(avatarImage);
    })();
  }, [community?.avatarFileId, getImage]);

  useFocusEffect(
    useCallback(() => {
      if (shouldRestoreStory.current) {
        shouldRestoreStory.current = false;
        setViewStory(true);
        return;
      }
      getStoryTarget({
        targetId: communityId,
        targetType: 'community',
      });
      getStories({
        targetId: communityId,
        targetType: 'community',
      });
    }, [communityId, getStoryTarget, getStories])
  );

  const onPressCreateStory = useCallback(() => {
    hasStoryPermission &&
      navigation.navigate('CreateStory', {
        targetId: communityId,
        targetType: 'community',
      });
  }, [communityId, hasStoryPermission, navigation]);

  const onPressStoryView = useCallback(() => {
    setViewStory(true);
  }, []);

  const onPressAvatar = useCallback(() => {
    setViewStory(false);
    onPressCreateStory();
  }, [onPressCreateStory]);

  const onPressCommunityName = useCallback(() => {
    setViewStory(false);
    navigation.navigate('CommunityProfilePage', {
      communityId: communityId,
    });
  }, [communityId, navigation]);

  const renderCommunityStory = () => {
    if (community?.isJoined) {
      return (
        <>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={
              storyTarget?.hasUnseen || stories.length > 0
                ? onPressStoryView
                : onPressCreateStory
            }
          >
            <Image
              source={
                avatarUrl
                  ? {
                      uri: avatarUrl,
                    }
                  : require('../../../core/assets/images/communityAvatar.png')
              }
              style={styles.communityAvatar}
            />
            <SvgXml
              style={styles.storyRing}
              width={48}
              height={48}
              xml={storyRing(storyRingColor[0], storyRingColor[1])}
            />
            {hasStoryPermission ? (
              storyTarget?.failedStoriesCount > 0 ? (
                <SvgXml style={styles.errorIcon} xml={errorIcon()} />
              ) : (
                <TouchableOpacity onPress={() => onPressCreateStory()}>
                  <SvgXml
                    style={styles.storyCreateIcon}
                    xml={storyCircleCreatePlusIcon()}
                  />
                </TouchableOpacity>
              )
            ) : null}
          </TouchableOpacity>
          <Typography.Caption style={styles.base}>Story</Typography.Caption>
        </>
      );
    }
    if (community?.isPublic && !community?.isJoined && stories.length > 0) {
      return (
        <>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={onPressStoryView}
          >
            <Image
              source={
                avatarUrl
                  ? {
                      uri: avatarUrl,
                    }
                  : require('../../../core/assets/images/communityAvatar.png')
              }
              style={styles.communityAvatar}
            />
            <SvgXml
              style={styles.storyRing}
              width={48}
              height={48}
              xml={storyRing(storyRingColor[0], storyRingColor[1])}
            />
          </TouchableOpacity>
          <Typography.Caption style={styles.base}>Story</Typography.Caption>
        </>
      );
    }

    return null;
  };

  const handleNavigateToUser = useCallback(
    (userId: string) => {
      shouldRestoreStory.current = true;
      setViewStory(false);
      navigation.navigate('UserProfile', { userId });
    },
    [navigation]
  );

  const onFinish = useCallback(() => {
    setViewStory(false);
    getStoryTarget({
      targetId: communityId,
      targetType: 'community',
    });
  }, [communityId, getStoryTarget]);

  if (community?.isPublic && !community?.isJoined && stories.length <= 0) {
    return null;
  }

  if (!hasStoryPermission && stories.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.storyItemWrap}>{renderCommunityStory()}</View>
      <Modal
        style={styles.modal}
        isOpen={viewStory}
        onClosed={() => setViewStory(false)}
        position="center"
        swipeToClose
        swipeArea={250}
        backButtonClose
        coverScreen={true}
      >
        <AmityViewStoryPage
          targetId={communityId}
          targetType="community"
          onFinish={onFinish}
          onPressAvatar={onPressAvatar}
          onPressCommunityName={onPressCommunityName}
          onNavigateToUser={handleNavigateToUser}
        />
      </Modal>
    </View>
  );
};

export default memo(CommunityStories);
