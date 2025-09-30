import React, {
  useState,
  useRef,
  useCallback,
  type MutableRefObject,
} from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { FeedRefType } from '~/v4/screen/CommunityHome';

import GalleryComponent from '~/v4/component/Gallery/GalleryComponent';
import { useSocialSettings } from '~/v4/hook/useSocialSettings';
import { useFollowUserStatus } from '~/v4/hook/useFollowUserStatus';
import { useStyles } from './styles';
import Tabs from '~/v4/component/core/Tabs';
import { feed, image, video } from '~/v4/assets/icons/';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import VideoComponent from './VideoComponent';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import AmityUserFeedComponent from '~/v4/PublicApi/Components/AmityUserFeedComponent/AmityUserFeedComponent';
import { FeedState } from '~/v4/elements/FeedState/FeedState';

interface FeedTabsProps {
  userId: string;
}

function Feed({ userId }: FeedTabsProps) {
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const { socialSettings } = useSocialSettings();
  const { followStatus } = useFollowUserStatus({ userId });

  type Tab =
    | ElementID.user_feed_tab_button
    | ElementID.user_image_feed_tab_button
    | ElementID.user_video_feed_tab_button;
  const [activeTab, setActiveTab] = useState<Tab>(
    ElementID.user_feed_tab_button
  );
  const feedRef: MutableRefObject<FeedRefType | null> =
    useRef<FeedRefType | null>(null);
  const galleryRef: MutableRefObject<FeedRefType | null> =
    useRef<FeedRefType | null>(null);
  const videoRef: MutableRefObject<FeedRefType | null> =
    useRef<FeedRefType | null>(null);

  const getActiveColor = useCallback(
    (isActive: boolean) => {
      return isActive ? theme.colors.base : theme.colors.baseShade2;
    },
    [theme]
  );

  const isMyProfile = !followStatus;
  const isAccepted = followStatus === 'accepted';
  const isBlocked = followStatus === 'blocked';

  const shouldShowPrivateProfile =
    !isMyProfile &&
    !isAccepted &&
    socialSettings?.userPrivacySetting === 'private';

  if (isBlocked) return null;

  if (shouldShowPrivateProfile) {
    return (
      <FeedState
        pageId={PageID.user_profile_page}
        componentId={ComponentID.user_feed}
        titleElementId={ElementID.private_user_feed}
        subTitleElementId={ElementID.private_user_feed_info}
        iconElementId={ElementID.private_user_feed}
      />
    );
  }

  return (
    <>
      <Tabs<Tab>
        variant="icon"
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      >
        <View style={styles.tabsContainer}>
          <Tabs.List>
            <Tabs.Tab<Tab>
              value={ElementID.user_feed_tab_button}
              icon={feed(
                getActiveColor(activeTab === ElementID.user_feed_tab_button)
              )}
              pageId={PageID.user_profile_page}
              componentId={ComponentID.user_feed}
              elementId={ElementID.user_feed_tab_button}
            />
            <Tabs.Tab<Tab>
              value={ElementID.user_image_feed_tab_button}
              icon={image(
                getActiveColor(
                  activeTab === ElementID.user_image_feed_tab_button
                )
              )}
              pageId={PageID.user_profile_page}
              componentId={ComponentID.user_image_feed}
              elementId={ElementID.user_image_feed_tab_button}
            />
            <Tabs.Tab<Tab>
              value={ElementID.user_video_feed_tab_button}
              icon={video(
                getActiveColor(
                  activeTab === ElementID.user_video_feed_tab_button
                )
              )}
              pageId={PageID.user_profile_page}
              componentId={ComponentID.user_video_feed}
              elementId={ElementID.user_video_feed_tab_button}
            />
          </Tabs.List>
        </View>
        <Tabs.Content<Tab> value={ElementID.user_feed_tab_button}>
          <AmityUserFeedComponent
            targetType="user"
            targetId={userId}
            ref={feedRef}
          />
        </Tabs.Content>
        <Tabs.Content<Tab> value={ElementID.user_image_feed_tab_button}>
          <GalleryComponent
            targetId={userId}
            ref={galleryRef}
            targetType="user"
          />
        </Tabs.Content>
        <Tabs.Content<Tab> value={ElementID.user_video_feed_tab_button}>
          <VideoComponent userId={userId} ref={videoRef} />
        </Tabs.Content>
      </Tabs>
    </>
  );
}

export default Feed;
