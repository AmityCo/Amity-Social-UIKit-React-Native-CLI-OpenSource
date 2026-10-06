// useNetworkOnline — whether the device currently has a network connection,
// backed by `@react-native-community/netinfo`.
//
// Same contract as chat's own `useNetworkOnline` (social must not import from
// chat, so the shared version lives here). NetInfo's `isConnected` is `null`
// until the first callback, so this starts `true` and only flips to `false` on
// an explicit disconnect, which avoids an offline flash on mount.

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
