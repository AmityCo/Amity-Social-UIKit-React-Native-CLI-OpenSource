import * as React from 'react';

import { FlatList, View } from 'react-native';
import { useStyles } from './styles';
import { AmityRecommendedCommunityComponent } from '../AmityRecommenedCommunityComponent/AmityRecommenedCommunityComponent';
import { PageID } from '../../../enum';
import { CategoryChip } from '../../../component/CategoryChip/CategoryChip';
import { useCategories } from '../../../hook/useCategories';
import { Typography } from '../../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { arrowRight } from '../../../assets/icons';

type AmityExploreComponentProps = {
  pageId?: PageID;
};

const AmityExploreComponent: React.FC<AmityExploreComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();
  const { categories, hasMore } = useCategories();

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        {categories?.length > 0 && (
          <FlatList
            data={categories}
            renderItem={({ item }) => <CategoryChip category={item} />}
            keyExtractor={(item) => item.categoryId}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsContentContainer}
            ListFooterComponent={
              hasMore ? (
                <View style={styles.seeMoreCategoryButton}>
                  <Typography.BodyBold style={styles.seeMoreCategoryText}>
                    {'See more'}
                  </Typography.BodyBold>
                  <SvgXml xml={arrowRight()} />
                </View>
              ) : null
            }
          />
        )}
      </View>
      <View style={styles.recommendContainer}>
        <AmityRecommendedCommunityComponent pageId={pageId} />
      </View>
    </View>
  );
};

export default AmityExploreComponent;
