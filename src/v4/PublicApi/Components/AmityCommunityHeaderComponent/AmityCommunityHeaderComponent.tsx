import React, {
  memo,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { View, ViewStyle } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
import { useStyles } from './styles';
import CommunityCover from '../../../elements/CommunityCover/CommunityCover';
import CommunityPrivateBadge from '../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityName from '../../../elements/CommunityName/CommunityName';
import CommunityVerifyBadge from '../../../elements/CommunityVerifyBadge/CommunityVerifyBadge';
import CommunityCategory from '../../../elements/CommunityCatetory/CommunityCategory';
import CommunityDescription from '../../../elements/CommunityDescription/CommunityDescription';
import CommunityInfo from '../../../elements/CommunityInfo/CommunityInfo';
import CommunityJoinButtonElement from '../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { Animated } from 'react-native';
import CommunityPendingPost from '../../../elements/CommunityPendingPost/CommunityPendingPost';
import { usePosts } from '../../../hook/usePosts';
import AmityStoryTabComponent from '../AmityStoryTabComponent/AmityStoryTabComponent';
import { AmityStoryTabComponentEnum } from '../../types';

export interface AmityCommunityHeaderRef {
  height: number;
}

type AmityCommunityHeaderComponentProps = {
  pageId?: PageID;
  communityId: string;
  scrollYRef?: React.RefObject<Animated.Value>;
  isFloating?: boolean;
  style?: ViewStyle;
  onHeightChange?: (height: number) => void;
};

const AmityCommunityHeaderComponent = forwardRef<
  AmityCommunityHeaderRef,
  AmityCommunityHeaderComponentProps
>(
  (
    {
      pageId = PageID.WildCardPage,
      communityId,
      isFloating = false,
      scrollYRef,
      style,
      onHeightChange,
    },
    ref
  ) => {
    const componentId = ComponentID.community_header;
    const { community } = useCommunity(communityId);
    const { posts: pendingPosts } = usePosts({
      targetType: 'community',
      targetId: communityId,
    });
    const { accessibilityId, themeStyles } = useAmityComponent({
      pageId,
      componentId,
    });

    const styles = useStyles(themeStyles);

    const scrollY = scrollYRef?.current;

    const [headerHeight, setHeaderHeight] = useState(0);
    // Use a single approach for updating height
    const updateHeaderHeight = (newHeight: number) => {
      if (newHeight > 0 && newHeight !== headerHeight) {
        console.log('Setting header height to:', newHeight);
        setHeaderHeight(newHeight);

        // Call the callback to notify parent
        if (onHeightChange) {
          onHeightChange(newHeight);
        }
      }
    };

    const animatedHeaderHeight = scrollY.interpolate({
      inputRange: [0, headerHeight],
      outputRange: [headerHeight, 60], // Shrink to 60px when scrolled
      extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
      inputRange: [headerHeight - 70, headerHeight - 40],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const miniHeaderOpacity = scrollY.interpolate({
      inputRange: [headerHeight - 70, headerHeight - 40],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    // Fix: Use proper useEffect for height updates
    useEffect(() => {
      // Make sure to expose height changes immediately
      if (ref) {
        // @ts-ignore - TypeScript might complain about this direct assignment
        console.log('ref.current', ref.current);
        // @ts-ignore - TypeScript might complain about this direct assignment
        ref.current = { height: headerHeight };
      }
    }, [headerHeight, ref]);

    // Expose header height to parent component
    useImperativeHandle(ref, () => ({
      height: headerHeight,
    }));

    const adjustedHeaderStyle = useMemo(() => {
      return {
        height: animatedHeaderHeight,
        opacity: miniHeaderOpacity,
      };
    }, [miniHeaderOpacity, animatedHeaderHeight]);

    if (!community) return null;

    return (
      <>
        {/* Mini header that appears when scrolled */}
        {scrollY && (
          <Animated.View
            style={[styles.smallHeaderAnimatedView, adjustedHeaderStyle]}
          >
            <View style={styles.smallHeaderContainer}>
              <Animated.Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                Community Profile
              </Animated.Text>
            </View>
          </Animated.View>
        )}
        {/* Full header */}
        <Animated.View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            updateHeaderHeight(height);
          }}
          style={[
            { opacity: headerOpacity },
            isFloating
              ? {
                  // Additional styles when floating
                  transform: [
                    {
                      translateY:
                        scrollY?.interpolate({
                          inputRange: [0, headerHeight || 1],
                          outputRange: [0, -(headerHeight || 1) / 4],
                          extrapolate: 'clamp',
                        }) || 0,
                    },
                  ],
                }
              : {},
            style, // Apply passed style
          ]}
        >
          <View
            testID={accessibilityId}
            accessibilityLabel={accessibilityId}
            style={styles.container}
          >
            <CommunityCover
              pageId={pageId}
              componentId={componentId}
              community={community}
            />
            <View style={styles.communityNameWrap}>
              {!community.isPublic && (
                <CommunityPrivateBadge
                  pageId={pageId}
                  componentId={componentId}
                />
              )}
              <CommunityName
                pageId={pageId}
                componentId={componentId}
                communityName={community.displayName}
              />
              {community.isOfficial && (
                <CommunityVerifyBadge
                  pageId={pageId}
                  componentId={componentId}
                />
              )}
            </View>
            <CommunityCategory
              pageId={pageId}
              componentId={componentId}
              categoryIds={community.categoryIds}
              allVisible={true}
              style={styles.categoryWrap}
            />
            <CommunityDescription
              pageId={pageId}
              componentId={componentId}
              description={community.description}
              style={styles.descriptionWrap}
            />
            <CommunityInfo
              pageId={pageId}
              componentId={componentId}
              community={community}
              style={styles.infoWrap}
            />
            {!community.isJoined && (
              <View style={styles.joinButtonWrap}>
                <CommunityJoinButtonElement
                  pageId={pageId}
                  componentId={componentId}
                  communityId={community.communityId}
                />
              </View>
            )}
            {pendingPosts?.length > 0 && (
              <CommunityPendingPost
                number={pendingPosts.length}
                pageId={pageId}
                componentId={componentId}
                style={styles.pendingPostWrap}
              />
            )}
            <AmityStoryTabComponent
              type={AmityStoryTabComponentEnum.communityFeed}
              targetId={communityId}
            />
          </View>
        </Animated.View>
      </>
    );
  }
);

export default memo(AmityCommunityHeaderComponent);
