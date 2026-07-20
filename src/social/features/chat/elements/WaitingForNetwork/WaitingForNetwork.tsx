// WaitingForNetwork — ported from AmityUiKitWeb v4/chat/elements/WaitingForNetwork.
// An offline indicator: a small spinner + label, shown only while the device is
// offline.
//
// RN adaptations from web:
//   - Web reads `react-use`'s `useNetworkState().online`; RN subscribes to
//     `@react-native-community/netinfo` (already a repo dependency).
//   - `state.isConnected` is `null` until the first callback, so we render only
//     when it is explicitly `false` (mirrors web's `online !== false` guard,
//     avoiding a flash on mount).

// 1. React / RN imports
import { useEffect, useState } from 'react';
import { View } from 'react-native';

// 2. Third-party imports
import NetInfo from '@react-native-community/netinfo';

// 3. Internal imports (relative)
import { Typography } from '../../../../../core/design/components/Typography';
import { Loader } from '../../../../../core/design/atoms/Loader';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 4. Named function component
export function WaitingForNetwork() {
  const { styles } = useStyles();
  const [isOffline, setIsOffline] = useState(false);
  const label = useString('amity_chat_waiting_for_network');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.waitingForNetwork}>
      <Loader.Spinner size="sm" />
      <Typography variant="caption" style={styles.text}>
        {label}
      </Typography>
    </View>
  );
}
