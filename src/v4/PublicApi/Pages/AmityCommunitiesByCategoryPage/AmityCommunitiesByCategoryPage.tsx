import {
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, { memo, useCallback } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage, useCommunities } from '../../../hook';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import CategoryTitle from '../../../elements/CategoryTitle/CategoryTitle';
import CommunityRowItem from '../../../component/CommunityRowItem/CommunityRowItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import CommunityEmptyTitle from '../../../elements/CommunityEmptyTitle/CommunityEmptyTitle';
import CommunityEmptyImage from '../../../elements/CommunityEmptyImage/CommunityEmptyImage';
import CommunityListSkeleton from '../../../component/CommunityListSkeleton/CommunityListSkeleton';

const AmityCommunitiesByCategoryPage = ({ route }: any) => {
  const pageId = PageID.communities_by_category_page;
  const { category } = route.params;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const { communities, loading, onNextCommunityPage } = useCommunities({
    categoryId: category.categoryId,
  });

  const styles = useStyles(themeStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCommunity = useCallback(
    ({ communityId, communityName }: { communityId; communityName }) => {
      navigation.navigate('CommunityHome', {
        communityId,
        communityName,
      });
    },
    [navigation]
  );

  return (
    <SafeAreaView testID={accessibilityId} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackButtonIconElement pageID={pageId} style={styles.headerIcon} />
        </TouchableOpacity>
        <CategoryTitle title={category.name} pageId={pageId} />
        <View style={styles.empty} />
      </View>
      {loading && !communities && (
        <View style={styles.loadingContainer}>
          <CommunityListSkeleton
            themeStyle={themeStyles}
            amount={12}
            hasTitle={false}
          />
        </View>
      )}
      {!loading && communities?.length === 0 && (
        <View style={styles.emptyMessage}>
          <CommunityEmptyImage pageId={pageId} />
          <CommunityEmptyTitle pageId={pageId} />
        </View>
      )}
      {communities?.length > 0 && (
        <FlatList
          data={communities}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                onPressCommunity({
                  communityId: item.communityId,
                  communityName: item.displayName,
                })
              }
            >
              <CommunityRowItem
                community={item}
                pageId={pageId}
                showJoinButton={false}
              />
            </Pressable>
          )}
          keyExtractor={(item) => item.communityId}
          contentContainerStyle={styles.listContent}
          onEndReached={() => onNextCommunityPage?.()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <CommunityListSkeleton themeStyle={themeStyles} amount={4} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default memo(AmityCommunitiesByCategoryPage);
