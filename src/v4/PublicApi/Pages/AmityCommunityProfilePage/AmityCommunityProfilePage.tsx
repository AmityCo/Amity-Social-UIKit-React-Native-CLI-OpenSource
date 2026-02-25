import {
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Easing,
  Modal,
  Pressable,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useStyles } from './styles';
import { ComponentID, PageID } from '../../../enum';
import { useAmityPage, useCommunity, useStoryPermission } from '../../../hook';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import CommunityCreatePostButton from '../../../elements/CommunityCreatePostButton/CommunityCreatePostButton';
import { SvgXml } from 'react-native-svg';
import { useBehaviour } from '../../../../v4/providers/BehaviourProvider';
import { livestream, poll, post, story } from '../../../../v4/assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import AmityCommunityPinnedPostComponent from '../../../../v4/PublicApi/Components/AmityCommunityPinnedPostComponent/AmityCommunityPinnedPostComponent';
import { usePostPermission } from '../../../../v4/hook/usePostPermission';

type ICommunityProfilePage = {
  defaultCommunityId?: string;
};
const AmityCommunityProfilePage: React.FC<ICommunityProfilePage> = ({
  defaultCommunityId,
}) => {
  const pageId = PageID.community_profile_page;

  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityProfilePage'>>();
  const routeCommunityId = route?.params?.communityId;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [communityId, setCommunityId] = useState<string>();
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

  const styles = useStyles(themeStyles);

  useEffect(() => {
    const routes = navigation.getState().routes;
    if (defaultCommunityId && routes.length === 1) {
      setCommunityId(defaultCommunityId);
    } else if (routeCommunityId) {
      setCommunityId(routeCommunityId);
    }
    return () => {
      setCommunityId(undefined);
    };
  }, [defaultCommunityId, routeCommunityId, navigation]);

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

  const renderTabComponent = () => {
    switch (currentTab) {
      case CommunityProfileTab.community_feed:
        return (
          <AmityCommunityFeedComponent
            pageId={pageId}
            communityId={communityId}
            ref={feedRef}
          />
        );
      case CommunityProfileTab.community_pin:
        return <AmityCommunityPinnedPostComponent communityId={communityId} />;
      case CommunityProfileTab.community_image_feed:
        return (
          <AmityCommunityImageFeedComponent
            pageId={pageId}
            communityId={communityId}
            ref={feedRef}
          />
        );
      case CommunityProfileTab.community_video_feed:
        return (
          <AmityCommunityVideoFeedComponent
            pageId={pageId}
            communityId={communityId}
            ref={feedRef}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {isScrolling && !isScrolledPastHeader && (
        <View style={styles.smallHeaderNavigationWrap}>
          <CommunityCoverNavigator
            pageId={pageId}
            componentId={ComponentID.community_header}
            communityId={communityId}
            isFromComponent={!!defaultCommunityId}
          />
        </View>
      )}
      {isScrolledPastHeader && (
        <Animated.View
          style={[
            styles.stickyHeaderContainer,
            {
              opacity: animatedOpacity,
              transform: [{ translateY: animatedTranslateY }],
            },
          ]}
        >
          <AmityCommunityHeaderComponent
            pageId={pageId}
            communityId={communityId}
            isScrolled={true}
            isScrolling={isScrolling}
            isFromComponent={!!defaultCommunityId}
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
          isFromComponent={!!defaultCommunityId}
        />
        {renderCommunityProfileTab()}
        {renderTabComponent()}
      </Animated.ScrollView>
      <CommunityProfileActions
        pageId={pageId}
        styles={styles}
        communityId={communityId}
      />
    </View>
  );
};

export default memo(AmityCommunityProfilePage);

function CommunityProfileActions({ pageId, communityId, styles }) {
  const { community } = useCommunity(communityId);
  const { colors } = useTheme<MyMD3Theme>();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const {
    AmityPostTargetSelectionPageBehavior,
    AmityPollTargetSelectionPageBehavior,
    AmityStoryTargetSelectionPageBehavior,
    AmityLivestreamPostTargetSelectionPageBehavior,
  } = useBehaviour();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CreatePost'>
    >();

  const hasStoryPermission = useStoryPermission(communityId);

  const hasPostPermission = usePostPermission({ community });

  const openBottomSheet = () => setIsBottomSheetVisible(true);

  const closeBottomSheet = () => setIsBottomSheetVisible(false);

  const handleCreatePost = () => {
    closeBottomSheet();

    if (AmityPostTargetSelectionPageBehavior.goToPostComposerPage) {
      return AmityPostTargetSelectionPageBehavior.goToPostComposerPage({
        community,
        targetId: communityId,
        targetType: 'community',
      });
    }

    return navigation.navigate('CreatePost', {
      community,
      targetId: communityId,
      targetType: 'community',
    });
  };

  const handleCreateStory = () => {
    closeBottomSheet();

    if (AmityStoryTargetSelectionPageBehavior.goToStoryComposerPage) {
      return AmityStoryTargetSelectionPageBehavior.goToStoryComposerPage({
        targetId: communityId,
        targetType: 'community',
      });
    }
    navigation.navigate('CreateStory', {
      targetId: communityId,
      targetType: 'community',
    });
  };

  const handleCreateLivestream = () => {
    closeBottomSheet();

    if (
      AmityLivestreamPostTargetSelectionPageBehavior.goToCreateLivestreamPage
    ) {
      return AmityLivestreamPostTargetSelectionPageBehavior.goToCreateLivestreamPage(
        {
          targetId: communityId,
          targetType: 'community',
          targetName: community?.displayName,
        }
      );
    }
    navigation.navigate('CreateLivestream', {
      targetId: communityId,
      targetType: 'community',
      targetName: community?.displayName,
    });
  };

  const handleCreatePoll = () => {
    closeBottomSheet();

    if (AmityPollTargetSelectionPageBehavior.goToPollPostComposerPage) {
      return AmityPollTargetSelectionPageBehavior.goToPollPostComposerPage({
        targetId: communityId,
        targetType: 'community',
        targetName: community?.displayName,
        community,
      });
    }
    navigation.navigate('PollPostComposer', {
      targetId: communityId,
      targetType: 'community',
      targetName: community?.displayName,
      community,
    });
  };

  if (!hasPostPermission) return null;

  return (
    <Fragment>
      <CommunityCreatePostButton pageId={pageId} onPress={openBottomSheet} />
      <Modal
        transparent
        animationType="fade"
        visible={isBottomSheetVisible}
        onRequestClose={closeBottomSheet}
      >
        <Pressable onPress={closeBottomSheet} style={styles.modalOverlay}>
          <Animated.View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <TouchableOpacity
              onPress={handleCreatePost}
              style={styles.bottomSheetOption}
            >
              <SvgXml
                xml={post({ fill: colors.base })}
                width={24}
                height={24}
              />
              <Text style={styles.bottomSheetOptionText}>Post</Text>
            </TouchableOpacity>
            {hasStoryPermission && (
              <TouchableOpacity
                onPress={handleCreateStory}
                style={styles.bottomSheetOption}
              >
                <SvgXml
                  width={24}
                  height={24}
                  xml={story({ fill: colors.base })}
                  fill={colors.base}
                />
                <Text style={styles.bottomSheetOptionText}>Story</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleCreatePoll}
              style={styles.bottomSheetOption}
            >
              <SvgXml width={24} height={24} xml={poll()} color={colors.base} />
              <Text style={styles.bottomSheetOptionText}>Poll</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateLivestream}
              style={styles.bottomSheetOption}
            >
              <SvgXml
                width={24}
                height={24}
                xml={livestream()}
                color={colors.base}
              />
              <Text style={styles.bottomSheetOptionText}>Livestream</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </Fragment>
  );
}
