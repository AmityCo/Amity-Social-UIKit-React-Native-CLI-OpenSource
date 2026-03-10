import { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useStyles } from './styles';
import { useAmityElement } from '../../../../../hooks';
import { View } from 'react-native';

type TrendingCommunityTitleProps = {
  pageId?: PageID;
};

const TrendingCommunityTitleComponent: FC<TrendingCommunityTitleProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const { isExcluded, accessibilityId, themeStyles, config } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.explore_trending_title,
  });

  const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <View style={styles.titleContainer}>
      <Typography.TitleBold testID={accessibilityId} style={styles.titleText}>
        {config?.text || 'Trending now'}
      </Typography.TitleBold>
    </View>
  );
};

export default memo(TrendingCommunityTitleComponent);
