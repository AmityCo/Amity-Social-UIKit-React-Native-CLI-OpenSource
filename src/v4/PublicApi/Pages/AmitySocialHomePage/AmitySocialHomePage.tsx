import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import CustomSocialTab from '../../../../v4/component/CustomSocialTab/CustomSocialTab';
import { useUiKitConfig } from '../../../../v4/hook';
import {
  ComponentID,
  ElementID,
  PageID,
} from '../../../../v4/enum/enumUIKitID';

import { useTheme } from 'react-native-paper';
import { useBehaviour } from '../../../../v4/providers/BehaviourProvider';
import AmitySocialHomeTopNavigationComponent from '../../../../v4/PublicApi/Components/AmitySocialHomeTopNavigationComponent/AmitySocialHomeTopNavigationComponent';
import AmityMyCommunitiesComponent from '../../../../v4/PublicApi/Components/AmityMyCommunitiesComponent/AmityMyCommunitiesComponent';
import AmityNewsFeedComponent from '../../../../v4/PublicApi/Components/AmityNewsFeedComponent/AmityNewsFeedComponent';
import AmityExploreComponent from '../../../../v4/PublicApi/Components/AmityExploreComponent/AmityExploreComponent';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

const AmitySocialHomePage = () => {
  const theme = useTheme() as MyMD3Theme;
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

  const [activeTab, setActiveTab] = useState<string>(newsFeedTab);
  const visitedTabs = useRef<Set<string>>(new Set([newsFeedTab]));

  const onTabChange = useCallback(
    (tabName: string) => {
      if (AmitySocialHomePageBehaviour.onChooseTab)
        return AmitySocialHomePageBehaviour.onChooseTab(tabName);
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
        tabNames={[newsFeedTab, exploreTab, myCommunitiesTab]}
        onTabChange={onTabChange}
        activeTab={activeTab}
      />
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
    </SafeAreaView>
  );
};
export default React.memo(AmitySocialHomePage);
