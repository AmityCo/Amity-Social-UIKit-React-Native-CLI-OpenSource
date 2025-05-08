import React, { FC, memo } from 'react';
import { CommunityCategoryChips } from '../../component/CommunityCategoryChips/CommunityCategoryChips';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';

type CommunityCategoryProps = {
  categoryIds: Amity.Category['categoryId'][];
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityCategory: FC<CommunityCategoryProps> = ({
  categoryIds,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const { accessibilityId, themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_category,
  });

  if (isExcluded) return null;

  return (
    <CommunityCategoryChips
      categoryIds={categoryIds}
      themeStyles={themeStyles}
      testID={accessibilityId}
    />
  );
};

export default memo(CommunityCategory);
