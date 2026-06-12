import { View, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { memo, useCallback } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../enums';
import { useAmityPage, useCommunities } from '../../hooks';
import BackButtonIconElement from '../../elements/BackButtonIconElement/BackButtonIconElement';
import CategoryTitle from '../../elements/CategoryTitle/CategoryTitle';
import CommunityRowItem from '../../components/CommunityRowItem/CommunityRowItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import CommunityEmptyTitle from '../../elements/CommunityEmptyTitle/CommunityEmptyTitle';
import CommunityEmptyImage from '../../elements/CommunityEmptyImage/CommunityEmptyImage';
import CommunityListSkeleton from '../../components/CommunityListSkeleton/CommunityListSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

const AmityCommunitiesByCategoryPage = ({ route }: any) => {
  const pageId = PageID.communities_by_category_page;
  const { category } = route.params;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const { communities, loading, onNextCommunityPage } = useCommunities({
    categoryId: category.categoryId,
    membership: 'all',
  });

  const styles = useStyles(themeStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCommunity = useCallback(
    ({ communityId }: { communityId: string }) => {
      navigation.navigate('CommunityProfilePage', {
        communityId,
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
