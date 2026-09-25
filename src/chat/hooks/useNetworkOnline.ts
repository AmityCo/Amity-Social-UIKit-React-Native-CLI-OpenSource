// useNetworkOnline — RN replacement for AmityUiKitWeb's `react-use`
// `useNetworkState().online`, backed by `@react-native-community/netinfo`
// (already a repo dependency; see elements/WaitingForNetwork).
//
// Returns `{ online: boolean }`. NetInfo's `isConnected` is `null` until the
// first callback, so we default to `true` and only flip to `false` on an explicit
// disconnect — mirroring web's `online !== false` guard and avoiding an
// offline flash on mount.

import { useEffect, useState } from 'react';

import NetInfo from '@react-native-community/netinfo';

export type UseNetworkOnlineReturn = {
  online: boolean;
};

export function useNetworkOnline(): UseNetworkOnlineReturn {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });
    return () => unsubscribe();
  }, []);

  return { online };
}
