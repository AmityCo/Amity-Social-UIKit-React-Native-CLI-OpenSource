import { useState, useRef } from 'react';
import { useUser, useFollowInfo } from '../../../../hooks/objects';
import { UserProfileTab, FeedRef } from '../types';
import { useStyles } from '../styles';
import { ScrollView } from 'react-native';
import useAuth from '../../../../../core/hooks/useAuth';
import { useAmityPage, useAmityElement } from '../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../enums';

export function useUserProfile(userId: string) {
  const styles = useStyles();
  const feedRef = useRef<FeedRef>(null);
  const scrollRef = useRef<ScrollView>(null);

  const { client } = useAuth();
  const isMyProfile = client?.userId === userId;

  const { user, isLoading } = useUser({ userId });
  const { followInfo } = useFollowInfo({ userId, enabled: !isMyProfile });
  const isBlockedByMe = followInfo?.status === 'blocked';

  const [headerHeight, setHeaderHeight] = useState(0);
  const [isTabSticky, setIsTabSticky] = useState(false);
  const [activeTab, setActiveTab] = useState<UserProfileTab>(
    UserProfileTab.Feed
  );

  const pageId = PageID.user_profile_page;
  const { accessibilityId } = useAmityPage({ pageId });
  const { accessibilityId: feedTabId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.user_feed_tab_button,
  });
  const { accessibilityId: imageTabId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.user_image_feed_tab_button,
  });
  const { accessibilityId: videoTabId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.user_video_feed_tab_button,
  });

  return {
    user,
    isUserLoading: isLoading,
    isBlockedByMe,
    activeTab,
    setActiveTab,
    styles,
    feedRef,
    scrollRef,
    headerHeight,
    setHeaderHeight,
    isTabSticky,
    setIsTabSticky,
    accessibilityId,
    feedTabId,
    imageTabId,
    videoTabId,
  };
}
