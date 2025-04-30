import React, { FC, memo } from 'react';
import { CommunityCategoryChips } from '../../component/CommunityCategoryChips/CommunityCategoryChips';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { View, ViewProps } from 'react-native';

type CommunityCategoryProps = ViewProps & {
  categoryIds: Amity.Category['categoryId'][];
  pageId?: PageID;
  componentId?: ComponentID;
  allVisible?: boolean;
};

const CommunityCategory: FC<CommunityCategoryProps> = ({
  categoryIds,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  allVisible = false,
  ...props
}) => {
  const { accessibilityId, themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_category,
  });

  if (isExcluded) return null;

  return (
    <View {...props}>
      <CommunityCategoryChips
        categoryIds={categoryIds}
        themeStyles={themeStyles}
        testID={accessibilityId}
        allVisible={allVisible}
      />
    </View>
  );
};

export default memo(CommunityCategory);
