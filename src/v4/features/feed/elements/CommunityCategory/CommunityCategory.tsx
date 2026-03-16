import React from 'react';
import { DimensionValue, Text, View } from 'react-native';
import { useStyles } from './styles';
import { useAmityElement } from '../../../../hook';
import { ComponentID, ElementID, PageID } from '../../../../enum';

type CommunityCategoryProps = {
  categoryName: string;
  style?: object;
  maxWidth?: number | string;
  pageId?: PageID;
  componentId?: ComponentID;
};

export function CommunityCategory({
  categoryName,
  style,
  maxWidth,
  pageId,
  componentId,
}: CommunityCategoryProps) {
  const { styles } = useStyles();
  const { accessibilityId, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_category,
  });

  if (isExcluded) return null;

  return (
    <View
      testID={accessibilityId}
      style={[
        styles.chipContainer,
        maxWidth ? { maxWidth: maxWidth as DimensionValue } : null,
        style,
      ]}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {categoryName}
      </Text>
    </View>
  );
}
