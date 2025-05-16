import { View, Animated } from 'react-native';
import React, { memo, useRef, useState } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage } from '../../../hook';
import AmityCommunityHeaderComponent, {
  AmityCommunityHeaderRef,
} from '../../Components/AmityCommunityHeaderComponent/AmityCommunityHeaderComponent';
import AmityCommunityFeedComponent from '../../Components/AmityCommunityFeedComponent/AmityCommunityFeedComponent';
import AmityCommunityProfileTabComponent, {
  CommunityProfileTab,
} from '../../Components/AmityCommunityProfileTabComponent/AmityCommunityProfileTabComponent';
import AmityCommunityImageFeedComponent from '../../Components/AmityCommunityImageFeedComponent/AmityCommunityImageFeedComponent';
import AmityCommunityVideoFeedComponent from '../../Components/AmityCommunityVideoFeedComponent/AmityCommunityVideoFeedComponent';

const AmityCommunityProfilePage = ({ route }: any) => {
  const pageId = PageID.community_profile_page;
  const { communityId } = route.params;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const [currentTab, setCurrentTab] = useState(
    CommunityProfileTab.community_feed
  );

  // Create a ref for the header component
  const headerRef = useRef<AmityCommunityHeaderRef>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const styles = useStyles(themeStyles);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYRef = useRef(scrollY);

  // // Update header height when it changes
  // useEffect(() => {
  //   console.log('headerRef.current?.height', headerRef.current);
  //   if (headerRef.current) {
  //     setHeaderHeight(headerRef.current.height);
  //   }
  // }, [headerRef.current?.height]);

  // Define sticky header component
  const StickyHeaderComponent = React.useCallback(() => {
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

  const renderTabComponent = React.useCallback(() => {
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
    <View
      testID={accessibilityId}
      style={styles.container}
      accessibilityLabel={accessibilityId}
    >
      {/* Main scrollable content */}
      <AmityCommunityHeaderComponent
        ref={headerRef}
        pageId={pageId}
        communityId={communityId}
        scrollYRef={scrollYRef}
        isFloating={true} // Add this prop to indicate it's floating above content
        onHeightChange={setHeaderHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: 'box-none', // Important! Allows touches to pass through when needed
        }}
      />
      <Animated.ScrollView
        StickyHeaderComponent={StickyHeaderComponent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Placeholder with same height as header */}
        <View style={{ height: headerHeight }} />
        {StickyHeaderComponent()}
        {/* Modified to render feed inline in ScrollView */}
        {renderTabComponent()}
      </Animated.ScrollView>
    </View>
  );
};

export default memo(AmityCommunityProfilePage);
