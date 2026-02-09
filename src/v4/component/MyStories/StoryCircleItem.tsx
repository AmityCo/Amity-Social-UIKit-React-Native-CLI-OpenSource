import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import {
  errorIcon,
  officialIcon,
  privateIcon,
  storyRing,
} from '../../../svg/svg-xml-list';
import { ComponentID, ElementID, ImageSizeState, PageID } from '../../enum';
import { useFile, useStoryPermission } from '../../hook';
import useConfig from '../../hook/useConfig';
import { useStyles } from './styles';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

interface IStoryCircleItem {
  onPressStoryView: (storyTarget: Amity.StoryTarget) => void;
  storyTarget: Amity.StoryTarget;
}

const StoryCircleItem: FC<IStoryCircleItem> = ({
  onPressStoryView,
  storyTarget,
}) => {
  const theme = useTheme() as MyMD3Theme;
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [communityData, setCommunityData] = useState<Amity.Community>(null);
  const hasStoryPermission = useStoryPermission(storyTarget.targetId);
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
    if (storyTarget.targetType !== 'community') return;
    CommunityRepository.getCommunity(
      storyTarget.targetId,
      async ({ error, loading, data }) => {
        if (error) return;
        if (!loading) {
          setCommunityData(data);
          const avatarImage = await getImage({
            fileId: data.avatarFileId,
            imageSize: ImageSizeState.small,
          });
          setAvatarUrl(avatarImage);
        }
      }
    );
  }, [getImage, storyTarget.targetId, storyTarget.targetType]);

  if (storyTarget.targetType !== 'community') return null;
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
            : require('../../assets/images/userAvatar.png')
        }
        style={styles.communityAvatar}
      />
      <SvgXml
        style={styles.storyRing}
        width={68}
        height={68}
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
