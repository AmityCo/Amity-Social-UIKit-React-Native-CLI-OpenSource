// useSearchChannel — ported from AmityUiKitWeb
// v4/chat/features/search/hooks/useSearchChannel.
//
// Web reads its search state from a `ChatSearchProvider` context and calls
// `useChatNavigation().pop()` to cancel. RN has no ChatSearchProvider, so this
// hook owns the state locally (searchText + debounced query + active tab), the
// same pattern MemberTabs uses (useState + a setTimeout debounce). `cancel`
// clears the query and pops the navigation stack.

import { useEffect, useState } from 'react';

import { useChatNavigation } from '../../../hooks/useChatNavigation';
import { SEARCH_DEBOUNCE_MS, SEARCH_TAB } from '../../../constants';

type SearchTabValue = (typeof SEARCH_TAB)[keyof typeof SEARCH_TAB];

export function useSearchChannel() {
  const { pop } = useChatNavigation();
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTabValue>(SEARCH_TAB.CHATS);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(searchText.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  function clearSearch() {
    setSearchText('');
    setDebouncedQuery('');
  }

  function cancel() {
    clearSearch();
    pop();
  }

  return {
    searchText,
    setSearchText,
    debouncedQuery,
    clearSearch,
    cancel,
    activeTab,
    setActiveTab,
  };
}
