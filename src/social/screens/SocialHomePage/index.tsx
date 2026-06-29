import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CustomSocialTab from '../../components/CustomSocialTab/CustomSocialTab';
import { useAmityElement, useUiKitConfig } from '../../hooks';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';
import { useTheme } from 'react-native-paper';
import { useBehaviour } from '../../providers/BehaviourProvider';
import AmitySocialHomeTopNavigationComponent from '../../features/feed/components/TopNavigation';
import AmityMyCommunitiesComponent from '../../features/feed/components/MyCommunities';
import AmityNewsFeedComponent from '../../features/feed/components/NewsFeed';
import AmityExploreComponent from '../../features/feed/components/Explore';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfile from '../../features/user/Profile';
import useAuth from '../../../core/hooks/useAuth';
import Divider from '../../components/Divider';

const PROFILE_TAB = 'Profile';

const AmitySocialHomePage = () => {
  const theme = useTheme() as MyMD3Theme;
  const { client } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  const { AmitySocialHomePageBehaviour } = useBehaviour();

  const [newsFeedTab] = useUiKitConfig({
    page: PageID.social_home_page,
    component: ComponentID.WildCardComponent,
    element: ElementID.newsfeed_button,
    keys: ['text'],
  }) as string[];

  const [exploreTab] = useUiKitConfig({
    page: PageID.social_home_page,
    component: ComponentID.WildCardComponent,
    element: ElementID.explore_button,
    keys: ['text'],
  }) as string[];

  const [myCommunitiesTab] = useUiKitConfig({
    page: PageID.social_home_page,
    component: ComponentID.WildCardComponent,
    element: ElementID.my_communities_button,
    keys: ['text'],
  }) as string[];

  const { isExcluded: isExploreExcluded } = useAmityElement({
    pageId: PageID.social_home_page,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.explore_button,
  });

  const allTabs = [newsFeedTab, exploreTab, myCommunitiesTab, PROFILE_TAB];
  const visibleTabs = isExploreExcluded
    ? allTabs.filter((t) => t !== exploreTab)
    : allTabs;

  const [activeTab, setActiveTab] = useState<string>(newsFeedTab);
  const visitedTabs = useRef<Set<string>>(new Set([newsFeedTab]));

  const onTabChange = useCallback(
    (tabName: string) => {
      if (AmitySocialHomePageBehaviour?.onChooseTab)
        return AmitySocialHomePageBehaviour?.onChooseTab(tabName);
      visitedTabs.current.add(tabName);
      setActiveTab(tabName);
    },
    [AmitySocialHomePageBehaviour]
  );

  const onPressExploreCommunity = useCallback(() => {
    onTabChange(exploreTab);
  }, [exploreTab, onTabChange]);

  const tabStyle = (tab: string) => ({
    flex: 1,
    display: activeTab === tab ? ('flex' as const) : ('none' as const),
  });

  return (
    <SafeAreaView
      testID="social_home_page"
      accessibilityLabel="social_home_page"
      id="social_home_page"
      style={styles.container}
    >
      <AmitySocialHomeTopNavigationComponent activeTab={activeTab} />
      <CustomSocialTab
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabNames={visibleTabs}
      />
      <Divider />
      <View style={tabStyle(newsFeedTab)}>
        <AmityNewsFeedComponent
          pageId={PageID.social_home_page}
          onPressExploreCommunity={onPressExploreCommunity}
        />
      </View>
      {visitedTabs.current.has(exploreTab) && (
        <View style={tabStyle(exploreTab)}>
          <AmityExploreComponent pageId={PageID.social_home_page} />
        </View>
      )}
      {visitedTabs.current.has(myCommunitiesTab) && (
        <View style={tabStyle(myCommunitiesTab)}>
          <AmityMyCommunitiesComponent
            pageId={PageID.social_home_page}
            componentId={ComponentID.my_communities}
          />
        </View>
      )}
      {visitedTabs.current.has(PROFILE_TAB) && (
        <View style={tabStyle(PROFILE_TAB)}>
          <UserProfile inline stickyTab={false} userId={client?.userId ?? ''} />
        </View>
      )}
    </SafeAreaView>
  );
};
export default React.memo(AmitySocialHomePage);
