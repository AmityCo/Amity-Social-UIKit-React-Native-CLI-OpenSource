import { Image, Text, TouchableOpacity, View } from 'react-native';
import { FC, useEffect, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import {
  errorIcon,
  officialIcon,
  privateIcon,
  storyRing,
} from '../../../core/assets/icons/xml';
import { ComponentID, ElementID, ImageSizeState, PageID } from '../../enums';
import { useFile, useStoryPermission } from '../../hooks';
import useConfig from '../../hooks/useConfig';
import { useStyles } from './styles';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { defaultCommunityAvatarUri } from '../../../core/assets';

interface IStoryCircleItem {
  onPressStoryView: (storyTarget: Amity.StoryTarget) => void;
  storyTarget: Amity.StoryTarget;
}

const StoryCircleItem: FC<IStoryCircleItem> = ({
  onPressStoryView,
  storyTarget,
}) => {
  const theme = useTheme() as MyMD3Theme;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [communityData, setCommunityData] = useState<Amity.Community | null>(
    null
  );
  const [communityLoading, setCommunityLoading] = useState(true);
  const { hasStoryPermission } = useStoryPermission(storyTarget.targetId);
  const { getImage } = useFile();
  const { getUiKitConfig } = useConfig();
  const styles = useStyles();
  const storyRingColor: string[] =
    hasStoryPermission && storyTarget?.failedStoriesCount > 0
      ? ['#DE1029', '#DE1029']
      : storyTarget?.hasUnseen
      ? (getUiKitConfig({
          page: PageID.StoryPage,
          component: ComponentID.StoryTab,
          element: ElementID.StoryRing,
        })?.progress_color as string[]) ?? ['#e2e2e2', '#e2e2e2']
      : ['#e2e2e2', '#e2e2e2'];

  useEffect(() => {
    if (storyTarget.targetType !== 'community') return null;
    const unsubscribe = CommunityRepository.getCommunity(
      storyTarget.targetId,
      async ({ error, loading, data }) => {
        if (error) {
          setCommunityLoading(false);
          return;
        }
        if (!loading) {
          setCommunityData(data);
          setCommunityLoading(false);
          const avatarImage = await getImage({
            fileId: data.avatarFileId,
            imageSize: ImageSizeState.small,
            type: 'community',
          });
          setAvatarUrl(avatarImage);
        }
      }
    );
    return () => unsubscribe();
  }, [getImage, storyTarget.targetId, storyTarget.targetType]);

  if (storyTarget.targetType !== 'community') return null;

  // Global story feed: only show stories from communities the user has joined.
  // Public community stories are visible on the community profile page,
  // but must NOT appear in the global story feed for non-members.
  // Private community stories are never returned by the SDK for non-members,
  // but we guard here as an extra safety net.
  if (!communityLoading && !communityData?.isJoined) return null;
  return (
    <TouchableOpacity
      key={storyTarget.targetId}
      style={styles.avatarContainer}
      onPress={() => onPressStoryView(storyTarget)}
    >
      <Image
        source={
          avatarUrl
            ? {
                uri: avatarUrl,
              }
            : { uri: defaultCommunityAvatarUri }
        }
        style={styles.communityAvatar}
      />
      <SvgXml
        style={styles.storyRing}
        width={64}
        height={64}
        xml={storyRing(storyRingColor[0], storyRingColor[1])}
      />
      {hasStoryPermission && storyTarget?.failedStoriesCount > 0 ? (
        <View style={styles.errorIcon}>
          <SvgXml width={16} height={16} xml={errorIcon()} />
        </View>
      ) : communityData?.isOfficial ? (
        <SvgXml
          style={styles.officialIcon}
          xml={officialIcon(theme.colors.primary)}
        />
      ) : null}
      <View style={styles.textRow}>
        {!communityData?.isPublic && (
          <SvgXml width={17} height={17} xml={privateIcon(theme.colors.base)} />
        )}
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.itemText}>
          {communityData?.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default StoryCircleItem;
