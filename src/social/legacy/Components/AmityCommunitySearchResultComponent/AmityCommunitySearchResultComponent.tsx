import React, { FC, memo } from 'react';
import { TabName } from '../../../enums/enumTabName';
import { ComponentID, PageID } from '../../../enums';
import { useAmityComponent } from '../../../hooks';
import CommunitySearchResult from '../../../components/CommunitySearchResult/CommunitySearchResult';

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
