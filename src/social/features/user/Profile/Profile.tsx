import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Feed,
  Action,
  TopBar,
  Header,
  ImageFeed,
  VideoFeed,
} from './components';
import { useUserProfile } from './hooks/useUserProfile';
import Tabs from '../../../../core/components/Tabs';
import { UserProfileTab } from './types';
import { feed, image, video } from '../../../../core/assets/icons';

export type UserProfilePageProps = {
  userId: string;
  inline?: boolean;
};

function UserProfile({ userId, inline }: UserProfilePageProps) {
  const {
    user,
    styles,
    isUserLoading,
    activeTab,
    setActiveTab,
    feedRef,
    headerHeight,
    setHeaderHeight,
    isTabSticky,
    setIsTabSticky,
    scrollRef,
    accessibilityId,
    feedTabId,
    imageTabId,
    videoTabId,
  } = useUserProfile(userId);

  return (
    <SafeAreaView
      testID={accessibilityId}
      style={styles.container}
      edges={inline ? [] : undefined}
    >
      {!inline && (
        <TopBar
          userId={userId}
          displayName={user?.displayName}
          isShownDisplayName={isTabSticky}
          inline={inline}
        />
      )}
      <Tabs<UserProfileTab>
        variant="icon"
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setIsTabSticky(false);
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }}
      >
        <ScrollView
          ref={scrollRef}
          scrollEventThrottle={50}
          stickyHeaderIndices={[1]}
          onScroll={(e) => {
            const { contentOffset, layoutMeasurement, contentSize } =
              e.nativeEvent;
            setIsTabSticky(contentOffset.y >= headerHeight);
            const isNearBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 200;

            if (isNearBottom) feedRef.current?.loadMore();
          }}
        >
          <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
            {isUserLoading || !user ? (
              <Header.Skeleton />
            ) : (
              <Header user={user} inline={inline} />
            )}
          </View>
          <Tabs.List>
            <Tabs.Tab
              testID={feedTabId}
              aria-label="User Feed"
              value={UserProfileTab.Feed}
              iconProps={{ xml: feed() }}
            />
            <Tabs.Tab
              testID={imageTabId}
              aria-label="User Image Feed"
              value={UserProfileTab.Image}
              iconProps={{ xml: image() }}
            />
            <Tabs.Tab
              testID={videoTabId}
              aria-label="User Video Feed"
              value={UserProfileTab.Video}
              iconProps={{ xml: video() }}
            />
          </Tabs.List>
          <Tabs.Content value={UserProfileTab.Feed}>
            <Feed ref={feedRef} userId={userId} />
          </Tabs.Content>
          <Tabs.Content value={UserProfileTab.Image}>
            <ImageFeed ref={feedRef} userId={userId} />
          </Tabs.Content>
          <Tabs.Content value={UserProfileTab.Video}>
            <VideoFeed ref={feedRef} userId={userId} />
          </Tabs.Content>
        </ScrollView>
      </Tabs>
      {!inline && <Action userId={userId} />}
    </SafeAreaView>
  );
}

export default UserProfile;
