import { View } from 'react-native';
import React, { memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage } from '../../../hook';
import AllCategoriesTitle from '~/v4/elements/AllCategoriesTitle/AllCategoriesTitle';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';

const AmityAllCategoriesPage = () => {
  const pageId = PageID.all_categories_page;
  const { accessibilityId } = useAmityPage({
    pageId,
  });

  const styles = useStyles();

  return (
    <View testID={accessibilityId} style={styles.container}>
      <View style={styles.header}>
        <BackButtonIconElement pageID={pageId} />
        <AllCategoriesTitle title={'All Categories'} pageId={pageId} />
        <View style={styles.empty} />
      </View>
    </View>
  );
};

export default memo(AmityAllCategoriesPage);
