import React, { FC, memo } from 'react';
import { TabName } from '../../../enum/enumTabName';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent } from '../../../hook';
import CommunitySearchResult from '../../../component/CommunitySearchResult/CommunitySearchResult';

type AmityCommunitySearchResultComponentType = {
  pageId?: PageID;
  searchResult: Amity.Community[] & Amity.User[];
  searchType: TabName;
  onNextPage: () => void;
};

const AmityCommunitySearchResultComponent: FC<
  AmityCommunitySearchResultComponentType
> = ({ searchResult, onNextPage, pageId = PageID.WildCardPage }) => {
  const componentId = ComponentID.community_search_result;
  const { isExcluded } = useAmityComponent({ pageId, componentId });

  if (isExcluded) return null;
  if (!searchResult?.length) return null;

  return (
    <CommunitySearchResult
      pageId={pageId}
      componentId={componentId}
      communities={searchResult as Amity.Community[]}
      onNextPage={onNextPage}
    />
  );
};

export default memo(AmityCommunitySearchResultComponent);
