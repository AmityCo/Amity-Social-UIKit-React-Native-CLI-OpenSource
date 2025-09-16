import * as React from 'react';
import { useCallback, useState } from 'react';
import { LogBox, SafeAreaView, StyleSheet } from 'react-native';
import CustomSocialTab from '~/v4/component/CustomSocialTab/CustomSocialTab';
import { useUiKitConfig } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum/enumUIKitID';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
import { useBehaviour } from '~/v4/providers/BehaviourProvider';
import AmitySocialHomeTopNavigationComponent from '~/v4/PublicApi/Components/AmitySocialHomeTopNavigationComponent/AmitySocialHomeTopNavigationComponent';
import AmityEmptyNewsFeedComponent from '~/v4/PublicApi/Components/AmityEmptyNewsFeedComponent/AmityEmptyNewsFeedComponent';
import AmityMyCommunitiesComponent from '~/v4/PublicApi/Components/AmityMyCommunitiesComponent/AmityMyCommunitiesComponent';
import AmityNewsFeedComponent from '~/v4/PublicApi/Components/AmityNewsFeedComponent/AmityNewsFeedComponent';
import AmityExploreComponent from '~/v4/PublicApi/Components/AmityExploreComponent/AmityExploreComponent';
import NewsFeedLoadingComponent from '~/v4/component/NewsFeedLoadingComponent/NewsFeedLoadingComponent';
import { useCustomRankingGlobalFeed } from '~/v4/hook/useCustomRankingGlobalFeed';

LogBox.ignoreAllLogs(true);
const AmitySocialHomePage = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  const { AmitySocialHomePageBehaviour } = useBehaviour();
  const { itemWithAds: globalFeedPosts, loading } =
    useCustomRankingGlobalFeed();

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

  const [activeTab, setActiveTab] = useState<string>(newsFeedTab);

  const onTabChange = useCallback(
    (tabName: string) => {
      if (AmitySocialHomePageBehaviour.onChooseTab)
        return AmitySocialHomePageBehaviour.onChooseTab(tabName);
      setActiveTab(tabName);
    },
    [AmitySocialHomePageBehaviour]
  );

  const onPressExploreCommunity = useCallback(() => {
    onTabChange(exploreTab);
  }, [exploreTab, onTabChange]);

  const renderNewsFeed = () => {
    if (loading) return <NewsFeedLoadingComponent />;
    if (activeTab === exploreTab)
      return <AmityExploreComponent pageId={PageID.social_home_page} />;

    if (activeTab === newsFeedTab) {
      if (!loading && globalFeedPosts?.length === 0)
        return (
          <AmityEmptyNewsFeedComponent
            pageId={PageID.social_home_page}
            onPressExploreCommunity={onPressExploreCommunity}
          />
        );
      return <AmityNewsFeedComponent pageId={PageID.social_home_page} />;
    }
    if (activeTab === myCommunitiesTab)
      return (
        <AmityMyCommunitiesComponent
          pageId={PageID.social_home_page}
          componentId={ComponentID.my_communities}
        />
      );
    return null;
  };

  return (
    <SafeAreaView
      testID="social_home_page"
      accessibilityLabel="social_home_page"
      id="social_home_page"
      style={styles.container}
    >
      <AmitySocialHomeTopNavigationComponent activeTab={activeTab} />
      <CustomSocialTab
        tabNames={[newsFeedTab, exploreTab, myCommunitiesTab]}
        onTabChange={onTabChange}
        activeTab={activeTab}
      />
      {renderNewsFeed()}
    </SafeAreaView>
  );
};
export default React.memo(AmitySocialHomePage);
