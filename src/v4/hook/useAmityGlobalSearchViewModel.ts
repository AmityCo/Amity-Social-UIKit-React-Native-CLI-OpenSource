import {
  CommunityRepository,
  UserRepository,
} from '@amityco/ts-sdk-react-native';
import { useState, useEffect } from 'react';
import { TabName } from '../enum/enumTabName';

export const useAmityGlobalSearchViewModel = (
  searchValue: string,
  searchType: TabName
) => {
  const [onNextCommunityPage, setOnNextCommunityPage] = useState<
    (() => void) | null
  >(null);
  const [onNextMyCommunityPage, setMyOnNextCommunityPage] = useState<
    (() => void) | null
  >(null);
  const [onNextUserPage, setOnNextUserPage] = useState<(() => void) | null>(
    null
  );

  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    if (searchValue?.length < 3) return setSearchResult(null);
    if (searchType === TabName.MyCommunities) {
      setSearchResult(null);
      const unsubscribeCommunity = CommunityRepository.searchCommunities(
        {
          displayName: searchValue,
          membership: 'member',
          limit: 20,
          sortBy: 'displayName',
        },
        ({ error, loading, data, hasNextPage, onNextPage }) => {
          if (error) return setSearchResult(null);
          if (!loading) {
            setMyOnNextCommunityPage(() => (hasNextPage ? onNextPage : null));
            setSearchResult(data);
          }
        }
      );
      return () => unsubscribeCommunity();
    } else if (searchType === TabName.Communities) {
      setSearchResult(null);
      const unsubscribeCommunity = CommunityRepository.searchCommunities(
        {
          displayName: searchValue,
          membership: 'all',
          limit: 20,
          sortBy: 'displayName',
        },
        ({ error, loading, data, hasNextPage, onNextPage }) => {
          if (error) return setSearchResult(null);
          if (!loading) {
            setOnNextCommunityPage(() => (hasNextPage ? onNextPage : null));
            setSearchResult(data);
          }
        }
      );
      return () => unsubscribeCommunity();
    } else if (searchType === TabName.Users) {
      setSearchResult(null);
      const unsubscribeUser = UserRepository.searchUserByDisplayName(
        { displayName: searchValue, limit: 20 },
        ({ error, loading, data, hasNextPage, onNextPage }) => {
          if (error) return setSearchResult(null);
          if (!loading) {
            setOnNextUserPage(() => (hasNextPage ? onNextPage : null));
            setSearchResult(data);
          }
        }
      );
      return () => unsubscribeUser();
    } else {
      setSearchResult(null);
    }
  }, [searchType, searchValue]);

  return {
    searchResult,
    onNextCommunityPage,
    onNextUserPage,
    onNextMyCommunityPage,
  };
};
