import React, { FC, memo } from 'react';
import { useAmityComponent } from '../../../hook';
import { PageID, ComponentID } from '../../../enum';
import TitleElement from '../../Elements/TitleElement/TitleElement';
import { View } from 'react-native';
import { useStyles } from './styles';

type AmityExploreEmptyComponentProps = {
  pageId?: PageID;
};

const AmityExploreEmptyComponent: FC<AmityExploreEmptyComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const componentId = ComponentID.explore_community_empty;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = useStyles();

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId} style={styles.container}>
      <TitleElement
        pageId={pageId}
        componentId={componentId}
        style={styles.title}
      />
    </View>
  );
};
export default memo(AmityExploreEmptyComponent);
