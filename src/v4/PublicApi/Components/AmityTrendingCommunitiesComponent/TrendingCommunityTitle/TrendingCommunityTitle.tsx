import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../../../enum';
import { Typography } from '../../../../component/Typography/Typography';
import { useStyles } from './styles';
import { useAmityElement } from '../../../../hook';
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
        {config.text as string}
      </Typography.TitleBold>
    </View>
  );
};

export default memo(TrendingCommunityTitleComponent);
