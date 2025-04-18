import { View, FlatList } from 'react-native';
import React, { memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage, useCommunities } from '../../../hook';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import CategoryTitle from '../../../elements/CategoryTitle/CategoryTitle';
import CommunityRowItem from './CommunityRowItem/CommunityRowItem';

const AmityCommunitiesByCategoryPage = ({ route }: any) => {
  const pageId = PageID.all_categories_page;
  const { categoryId } = route.params;
  const { accessibilityId } = useAmityPage({
    pageId,
  });

  const { communities, loading } = useCommunities({
    categoryId: categoryId,
  });

  const styles = useStyles();

  // TODO: Add loading state
  if (loading) return null;

  return (
    <View testID={accessibilityId} style={styles.container}>
      <View style={styles.header}>
        <BackButtonIconElement pageID={pageId} />
        <CategoryTitle title={'All Categories'} pageId={pageId} />
        <View style={styles.empty} />
      </View>
      <FlatList
        data={communities}
        renderItem={({ item }) => (
          <CommunityRowItem community={item} pageId={pageId} />
        )}
        keyExtractor={(item) => item.communityId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default memo(AmityCommunitiesByCategoryPage);
