import React, { memo, FC, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  feed,
  image,
  // pin,
  video,
} from '../../../assets/icons';
import IconTab from '../../../component/IconTab/IconTab';
import { ComponentID, ElementID, PageID } from '../../../enum';
import { useAmityElement } from '../../../hook';

export const enum CommunityProfileTab {
  community_feed = 'community_feed',
  community_pin = 'community_pin',
  community_image_feed = 'community_image_feed',
  community_video_feed = 'community_video_feed',
}

type AmityCommunityProfileTabComponentProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  currentTab: CommunityProfileTab;
  onTabChange: (tab: CommunityProfileTab) => void;
};

const AmityCommunityProfileTabComponent: FC<
  AmityCommunityProfileTabComponentProps
> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  currentTab,
  onTabChange,
}) => {
  const elementId = ElementID.community_profile_tab;

  const { themeStyles, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeStyles?.colors.background,
      flexDirection: 'row',
      width: '100%',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
      borderBottomColor: themeStyles?.colors.baseShade4,
      borderBottomWidth: 1,
    },
  });

  const getActiveColor = useCallback(
    (isActive: boolean) => {
      return isActive
        ? themeStyles?.colors.base
        : themeStyles?.colors.baseShade2;
    },
    [themeStyles]
  );

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <Pressable
        onPress={() => onTabChange(CommunityProfileTab.community_feed)}
      >
        <IconTab
          themeStyles={themeStyles}
          icon={
            <SvgXml
              xml={feed(
                getActiveColor(
                  currentTab === CommunityProfileTab.community_feed
                )
              )}
            />
          }
          isActive={currentTab === CommunityProfileTab.community_feed}
        />
      </Pressable>
      {/* <Pressable onPress={() => onTabChange(CommunityProfileTab.community_pin)}>
        <IconTab
          themeStyles={themeStyles}
          icon={
            <SvgXml
              xml={pin(
                getActiveColor(currentTab === CommunityProfileTab.community_pin)
              )}
            />
          }
          isActive={currentTab === CommunityProfileTab.community_pin}
        />
      </Pressable> */}
      <Pressable
        onPress={() => onTabChange(CommunityProfileTab.community_image_feed)}
      >
        <IconTab
          themeStyles={themeStyles}
          icon={
            <SvgXml
              xml={image(
                getActiveColor(
                  currentTab === CommunityProfileTab.community_image_feed
                )
              )}
            />
          }
          isActive={currentTab === CommunityProfileTab.community_image_feed}
        />
      </Pressable>
      <Pressable
        onPress={() => onTabChange(CommunityProfileTab.community_video_feed)}
      >
        <IconTab
          themeStyles={themeStyles}
          icon={
            <SvgXml
              xml={video(
                getActiveColor(
                  currentTab === CommunityProfileTab.community_video_feed
                )
              )}
            />
          }
          isActive={currentTab === CommunityProfileTab.community_video_feed}
        />
      </Pressable>
    </View>
  );
};

export default memo(AmityCommunityProfileTabComponent);
