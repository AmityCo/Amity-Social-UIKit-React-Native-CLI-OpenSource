import {
  View,
  FlatList,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, { memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage, useCommunities } from '../../../hook';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import CategoryTitle from '../../../elements/CategoryTitle/CategoryTitle';
import CommunityRowItem from './CommunityRowItem/CommunityRowItem';
import { useNavigation } from '@react-navigation/native';

const AmityCommunitiesByCategoryPage = ({ route }: any) => {
  const pageId = PageID.all_categories_page;
  const { category } = route.params;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const { communities, loading } = useCommunities({
    categoryId: category.categoryId,
  });

  const styles = useStyles(themeStyles);
  const navigation = useNavigation();

  // TODO: Add loading state
  if (loading) return null;

  return (
    <SafeAreaView testID={accessibilityId} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackButtonIconElement pageID={pageId} style={styles.headerIcon} />
        </TouchableOpacity>
        <CategoryTitle title={category.name} pageId={pageId} />
        <View style={styles.empty} />
      </View>
      {!loading && communities.length === 0 ? (
        // TODO: add empty state
        <Text>No community</Text>
      ) : (
        <FlatList
          data={communities}
          renderItem={({ item }) => (
            <CommunityRowItem community={item} pageId={pageId} />
          )}
          keyExtractor={(item) => item.communityId}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

export default memo(AmityCommunitiesByCategoryPage);
