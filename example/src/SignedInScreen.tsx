import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import { View, StyleSheet } from 'react-native';
import config from '../uikit.config.json';

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
// SECURE MODE (optional) — only needed when secure mode is enabled on your
// network. Return a short-lived auth token for the given userId, minted by YOUR
// backend using your Server Key (never ship the Server Key in the app). The
// UIKit calls this on login and again on every session renewal, so it must
// always return a fresh token. Pass it to AmityUiKitProvider as `getAuthToken`.
// Leave it unused (as below) for unsecure / development mode.
//
// const getAuthToken = async (userId: string): Promise<string> => {
//   const res = await fetch(`https://your-backend.example.com/amity/auth-token?userId=${userId}`);
//   const { authToken } = await res.json();
//   return authToken;
// };

export default function SignedInScreen({
  apiKey,
  apiRegion,
  apiEndpoint,
  fcmToken,
  userId = '',
}: SignedInScreenProps) {
  return (
    <AmityUiKitProvider
      apiKey={apiKey}
      apiRegion={apiRegion}
      apiEndpoint={apiEndpoint}
      userId={userId}
      // Secure mode: uncomment to have the UIKit fetch an auth token per userId.
      // getAuthToken={getAuthToken}
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
