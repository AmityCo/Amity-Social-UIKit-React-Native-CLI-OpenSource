import {
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Easing,
} from 'react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useStyles } from './styles';
import { ComponentID, PageID } from '../../../enum';
import { useAmityPage } from '../../../hook';
import AmityCommunityHeaderComponent from '../../Components/AmityCommunityHeaderComponent/AmityCommunityHeaderComponent';
import AmityCommunityFeedComponent, {
  AmityCommunityFeedRef,
} from '../../Components/AmityCommunityFeedComponent/AmityCommunityFeedComponent';
import AmityCommunityProfileTabComponent, {
  CommunityProfileTab,
} from '../../Components/AmityCommunityProfileTabComponent/AmityCommunityProfileTabComponent';
import AmityCommunityImageFeedComponent from '../../Components/AmityCommunityImageFeedComponent/AmityCommunityImageFeedComponent';
import AmityCommunityVideoFeedComponent from '../../Components/AmityCommunityVideoFeedComponent/AmityCommunityVideoFeedComponent';
import CommunityCoverNavigator from '../../../elements/CommunityCover/CommunityCoverNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';

const AmityCommunityProfilePage = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'CommunityProfilePage'>) => {
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedTranslateY = useRef(new Animated.Value(15)).current;

  const scrollY = useRef(new Animated.Value(0)).current;
  const feedRef = useRef<AmityCommunityFeedRef>(null);

  useEffect(() => {
    if (isScrolledPastHeader) {
      // Reset animation values
      animatedOpacity.setValue(0);
      animatedTranslateY.setValue(15);

      // Run entrance animation
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScrolledPastHeader, animatedOpacity, animatedTranslateY]);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);

    if (feedRef.current) {
      feedRef.current.handleLoadMore();
    }

    setTimeout(() => setIsLoadingMore(false), 2000);
  }, [feedRef]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const yOffset = contentOffset.y;

    const isPastHeader = yOffset >= headerHeight - 100;

    if (isPastHeader !== isScrolledPastHeader) {
      setIsScrolledPastHeader(isPastHeader);
    }

    if (yOffset > 0) {
      setIsScrolling(true);
    } else {
      setIsScrolling(false);
    }

    const isScrollEndReached =
      layoutMeasurement.height + contentOffset.y + 200 >= contentSize.height;

    if (isScrollEndReached && feedRef.current && !isLoadingMore) {
      handleLoadMore();
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
            ref={feedRef}
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
          style={[
            styles.stickyHeaderContainer,
            {
              opacity: animatedOpacity, // Use the animated value
              transform: [{ translateY: animatedTranslateY }], // Add transform
            },
          ]}
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
