// useCreateConversation — state + actions for the create-conversation flow.
// Ported from AmityUiKitWeb's `useCreateConversation`.
//
// RN adaptations from web:
//   - Web debounces via `react-use`'s `useDebounce`; RN uses a plain
//     setTimeout effect (SEARCH_DEBOUNCE_MS).
//   - Web navigates via the in-app `ChatNavigationProvider` (`pop`/`replace`);
//     RN uses React Navigation. On success we `replace` to `AmityChatPage` so
//     the back button skips the create screen (parity with web `replace`).
//   - Web's `useMutation` pending state → an in-flight ref guard so a double-tap
//     can't fire two `createChannel` calls / two navigations. Creation is also
//     gated on `useAuth().isConnected` (the SDK needs a connected client).
//   - The web `replace` also carried `userId` + `isJustCreated`; the RN
//     `AmityChatPage` route only carries `{ channelId, userDisplayName }`, so
//     those two params are dropped.

import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../../../core/hooks/useAuth';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';

const SEARCH_DEBOUNCE_MS = 300;

export function useCreateConversation() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isConnected } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const isCreatingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedText(searchText),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  async function handleSelectUser(user: Amity.InternalUser) {
    if (!isConnected || isCreatingRef.current) return;
    isCreatingRef.current = true;
    try {
      const result = await ChannelRepository.createChannel({
        type: 'conversation',
        userIds: [user.userId],
      });
      const channelId = result?.data?.channelId;
      if (channelId) {
        navigation.replace('AmityChatPage', {
          channelId,
          userDisplayName: user.displayName,
        });
      }
    } finally {
      isCreatingRef.current = false;
    }
  }

  function handleClose() {
    navigation.goBack();
  }

  return {
    searchText,
    setSearchText,
    debouncedText,
    handleSelectUser,
    handleClose,
  };
}
