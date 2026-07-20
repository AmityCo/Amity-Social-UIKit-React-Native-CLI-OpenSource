import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import { View, StyleSheet } from 'react-native';
import config from '../uikit.config.json';
// ⚠️ TEST ONLY — remove with example/src/testAuth.ts before shipping.
import { makeTestGetAuthToken } from './testAuth';

type SignedInScreenProps = {
  apiKey: string;
  apiRegion: string;
  apiEndpoint: string;
  fcmToken?: string;
  /** The userId to sign in as directly (no visitor / create-profile step). */
  userId?: string;
  /**
   * Optional displayName. Leave undefined to test the "userId only" login path
   * — the SDK keeps the user's existing displayName instead of overwriting it.
   */
  displayName?: string;
};

/**
 * Signed-in flow.
 *
 * Mounts `AmityUiKitProvider` with a `userId` up front, so the provider runs a
 * normal signed-in `Client.login` immediately (no visitor session, no
 * create-profile page). Use this tab to test the app as an already-registered
 * user, and to verify that passing only `userId` (no `displayName`) preserves
 * the existing server-side displayName.
 */

export default function SignedInScreen({
  apiKey,
  apiRegion,
  apiEndpoint,
  fcmToken,
  userId = '',
}: SignedInScreenProps) {
  // ⚠️ TEST ONLY — remove with example/src/testAuth.ts before shipping.
  const getAuthToken = makeTestGetAuthToken(apiRegion);

  return (
    <AmityUiKitProvider
      apiKey={apiKey}
      apiRegion={apiRegion}
      apiEndpoint={apiEndpoint}
      userId={userId}
      // ⚠️ TEST ONLY: exercises secure-mode auth-token flow. Remove before ship.
      getAuthToken={getAuthToken}
      // Cast: node_modules has two copies of the config type, so the JSON's
      // inferred type and the provider's expected type are nominally distinct.
      configs={config as any}
      fcmToken={fcmToken}
      
    >
      <View style={styles.root}>
        <AmityUiKitSocial />
      </View>
    </AmityUiKitProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
