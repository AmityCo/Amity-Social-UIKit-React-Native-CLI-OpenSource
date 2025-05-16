import {
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useStyles } from './styles';
import { ComponentID, PageID } from '../../../enum';
import { useAmityPage } from '../../../hook';
import AmityCommunityHeaderComponent from '../../Components/AmityCommunityHeaderComponent/AmityCommunityHeaderComponent';
import AmityCommunityFeedComponent from '../../Components/AmityCommunityFeedComponent/AmityCommunityFeedComponent';
import AmityCommunityProfileTabComponent, {
  CommunityProfileTab,
} from '../../Components/AmityCommunityProfileTabComponent/AmityCommunityProfileTabComponent';
import AmityCommunityImageFeedComponent from '../../Components/AmityCommunityImageFeedComponent/AmityCommunityImageFeedComponent';
import AmityCommunityVideoFeedComponent from '../../Components/AmityCommunityVideoFeedComponent/AmityCommunityVideoFeedComponent';
import CommunityCoverNavigator from '../../../elements/CommunityCover/CommunityCoverNavigator';

const AmityCommunityProfilePage = ({ route }: any) => {
  const pageId = PageID.community_profile_page;
  const { communityId } = route.params;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const [currentTab, setCurrentTab] = useState(
    CommunityProfileTab.community_feed
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isScrolledPastHeader, setIsScrolledPastHeader] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [
      // Start fade when we're 150px from triggering header
      headerHeight - 120,
      // Complete fade right when the header becomes "sticky"
      headerHeight - 100,
    ],
    outputRange: [0.5, 1],
    extrapolate: 'clamp', // Prevents values from exceeding 0-1 range
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const isPastHeader = yOffset >= headerHeight - 120;

    if (isPastHeader !== isScrolledPastHeader) {
      setIsScrolledPastHeader(isPastHeader);
    }

    if (yOffset > 0) {
      setIsScrolling(true);
    } else {
      setIsScrolling(false);
    }
  };

  const styles = useStyles(themeStyles);

  const renderCommunityProfileTab = useCallback(() => {
    return (
      <AmityCommunityProfileTabComponent
        pageId={pageId}
        currentTab={currentTab}
        onTabChange={(tab: CommunityProfileTab) => {
          setCurrentTab(tab);
        }}
      />
    );
  }, [pageId, currentTab]);

  const renderTabComponent = useCallback(() => {
    switch (currentTab) {
      case CommunityProfileTab.community_feed:
        return (
          <AmityCommunityFeedComponent
            pageId={pageId}
            communityId={communityId}
          />
        );
      case CommunityProfileTab.community_image_feed:
        return (
          <AmityCommunityImageFeedComponent
            pageId={pageId}
            communityId={communityId}
          />
        );
      case CommunityProfileTab.community_video_feed:
        return (
          <AmityCommunityVideoFeedComponent
            pageId={pageId}
            communityId={communityId}
          />
        );
      default:
        return null;
    }
  }, [currentTab, pageId, communityId]);

  return (
    <View style={{ flex: 1 }}>
      {isScrolling && !isScrolledPastHeader && (
        <View style={styles.smallHeaderNavigationWrap}>
          <CommunityCoverNavigator
            pageId={pageId}
            componentId={ComponentID.community_header}
            communityId={communityId}
          />
        </View>
      )}
      {isScrolledPastHeader && (
        <Animated.View
          style={[styles.stickyHeaderContainer, { opacity: headerOpacity }]}
        >
          <AmityCommunityHeaderComponent
            pageId={pageId}
            communityId={communityId}
            isScrolled={true}
            isScrolling={isScrolling}
          />
          <View style={styles.smallHeaderCommunityTabWrap}>
            {renderCommunityProfileTab()}
          </View>
        </Animated.View>
      )}
      <Animated.ScrollView
        testID={accessibilityId}
        style={styles.container}
        accessibilityLabel={accessibilityId}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
        )}
        scrollEventThrottle={16}
      >
        <AmityCommunityHeaderComponent
          pageId={pageId}
          communityId={communityId}
          onHeightChange={setHeaderHeight}
          isScrolling={isScrolling}
        />
        {renderCommunityProfileTab()}
        {renderTabComponent()}
      </Animated.ScrollView>
    </View>
  );
};

export default memo(AmityCommunityProfilePage);
