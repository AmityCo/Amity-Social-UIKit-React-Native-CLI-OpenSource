import {
  CommunityRepository,
  SearchUsersByEnum,
  UserRepository,
} from '@amityco/ts-sdk-react-native';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ISearchItem } from '../components/legacy/SearchItem';

export type TSearchItem = Amity.User &
  ISearchItem &
  Amity.Membership<'community'> & { name: string; id: string };

const MIN_SEARCH_LENGTH = 3;

const useSearch = (
  searchText: string | undefined | null,
  privateCommunityId: string = ''
) => {
  const onNextPageRef = useRef<(() => void) | undefined | null>(null);
  const [searchResult, setSearchResult] = useState<TSearchItem[]>([]);
  const searchPrivateCommunityMember = useCallback(
    (text: string) => {
      return CommunityRepository.Membership.searchMembers(
        {
          communityId: privateCommunityId,
          ...(text ? { search: text } : {}),
          limit: 5,
          sortBy: 'firstCreated',
          memberships: ['member'],
          includeDeleted: false,
        },
        ({ data, error, hasNextPage, onNextPage }) => {
          if (error) return null;
          onNextPageRef.current = hasNextPage ? onNextPage : null;
          const mappedSearchData = data.map((item) => {
            return {
              ...item.user,
              name: item.user.displayName,
              id: item.userId,
            };
          }) as TSearchItem[];
          setSearchResult(mappedSearchData);
        }
      );
    },
    [privateCommunityId]
  );

  const getAllUsers = useCallback(() => {
    return UserRepository.getUsers(
      { limit: 5 },
      ({ data, error, hasNextPage, onNextPage }) => {
        if (error) return null;
        hasNextPage
          ? (onNextPageRef.current = onNextPage)
          : (onNextPageRef.current = null);
        const mappedSearchData = data.map((item) => {
          return {
            ...item,
            name: item.displayName,
            id: item.userId,
          };
        }) as TSearchItem[];
        setSearchResult(mappedSearchData);
      }
    );
  }, []);

  const searchAllUsers = useCallback((text: string) => {
    return UserRepository.searchUserByDisplayName(
      {
        displayName: text,
        limit: 5,
        searchBy: [SearchUsersByEnum.DISPLAY_NAME],
      },
      ({ data, error, hasNextPage, onNextPage }) => {
        if (error) return null;
        hasNextPage
          ? (onNextPageRef.current = onNextPage)
          : (onNextPageRef.current = null);
        const mappedSearchData = data.map((item) => {
          return {
            ...item,
            name: item.displayName,
            id: item.userId,
          };
        }) as TSearchItem[];
        setSearchResult(mappedSearchData);
      }
    );
  }, []);

  useEffect(() => {
    if (searchText == null) {
      onNextPageRef.current = null;
      setSearchResult([]);
      return () => {};
    }

    // Treat 1–2 character queries as empty: show all users without filtering.
    // Only send a search query once the user has typed at least MIN_SEARCH_LENGTH chars.
    const effectiveText =
      searchText.length > 0 && searchText.length < MIN_SEARCH_LENGTH
        ? ''
        : searchText;

    let unsubscribe: (() => void) | undefined;

    if (privateCommunityId) {
      unsubscribe = searchPrivateCommunityMember(effectiveText) ?? undefined;
    } else if (!effectiveText) {
      unsubscribe = getAllUsers() ?? undefined;
    } else {
      unsubscribe = searchAllUsers(effectiveText) ?? undefined;
    }

    return () => {
      unsubscribe?.();
    };
  }, [
    getAllUsers,
    privateCommunityId,
    searchAllUsers,
    searchPrivateCommunityMember,
    searchText,
  ]);

  return { searchResult, getNextPage: onNextPageRef.current };
};

export default useSearch;
