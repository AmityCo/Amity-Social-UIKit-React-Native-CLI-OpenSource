import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type FC,
} from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import type { AuthContextInterface } from '../types/auth';
import { Alert } from 'react-native';
import type { IAmityUIkitProvider } from './AmityUIKitProvider';
import { ERROR_CODE } from '../../core/constants';
import { onSdkReady } from '../routes/navigation';

export const AuthContext = createContext<AuthContextInterface>({
  client: null,
  isConnecting: false,
  error: '',
  login: () => {},
  logout: () => {},
  isConnected: false,
  sessionState: '',
  apiRegion: 'sg',
  authToken: '',
  fcmToken: undefined,
  isGlobalBan: false,
  isVisitorUsageLimitReached: false,
  isVisitorOrBot: false,
});

export const AuthContextProvider: FC<IAmityUIkitProvider> = ({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
  authToken,
  fcmToken,
}: IAmityUIkitProvider) => {
  const [error, setError] = useState('');
  const [isConnecting, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState('');
  const client: Amity.Client = Client.createClient(apiKey, apiRegion, {
    apiEndpoint: { http: apiEndpoint },
  });
  const [isGlobalBan, setIsGlobalBan] = useState(false);
  const [isVisitorUsageLimitReached, setIsVisitorUsageLimitReached] =
    useState(false);
  const [isVisitorOrBot, setIsVisitorOrBot] = useState(false);

  const sessionHandler: Amity.SessionHandler = {
    sessionWillRenewAccessToken(renewal) {
      renewal.renew();
    },
  };

  useEffect(() => {
    return Client.onSessionStateChange(
      (state: Amity.SessionStates, reason: Amity.TokenTerminationReason) => {
        setSessionState(state);
        setIsGlobalBan(reason === 'globalBan');
      }
    );
  }, []);

  useEffect(() => {
    if (sessionState === 'established') {
      setIsConnected(true);
      onSdkReady();
      // Same check as the Web UIKit's isVisitorOrBot in SDKProvider
      setIsVisitorOrBot(Client.getCurrentUserType() !== 'signed-in');
    }
  }, [sessionState]);

  useEffect(() => {
    // SDK emits this (throttled, 2s window) when a visitor/bot session gets
    // error 400323 — daily usage limit exceeded. The session stays alive, so
    // this is tracked separately from isGlobalBan. In-memory only: the flag
    // resets when the provider remounts or the user signs in with a userId.
    return Client.onVisitorUsageLimitReached(() => {
      setIsVisitorUsageLimitReached(true);
    });
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      if (userId) {
        let loginParam: Amity.ConnectClientParams = {
          userId: userId,
          displayName: displayName,
        };
        if (authToken?.length > 0) {
          loginParam = { ...loginParam, authToken: authToken };
        }
        const response = await Client.login(loginParam, sessionHandler);
        if (!response) return;
      } else {
        // No userId — connect as a visitor (read-only session, same
        // convention as the Web UIKit's registerDevice without userId)
        const response = await Client.loginAsVisitor({ sessionHandler });
        if (!response) return;
      }
    } catch (err) {
      if (err?.message?.includes(ERROR_CODE.GLOBAL_BAN)) {
        setIsGlobalBan(true);
      }
    }

    if (fcmToken) {
      try {
        await Client.registerPushNotification(fcmToken);
      } catch (err) {
        console.log(err);
      }
    }
    // Depend on userId (and the other login params) so that when the host
    // switches a visitor session to a signed-in one by passing a userId, this
    // callback re-reads the new value and calls Client.login instead of
    // re-using the stale (undefined) userId and re-connecting as a visitor.
  }, [userId, displayName, authToken, fcmToken]);

  const login = async () => {
    setError('');
    setLoading(true);
    try {
      await handleConnect();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      setError(errorText);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setIsVisitorUsageLimitReached(false);
    login();
  }, [userId]);

  const logout = async () => {
    try {
      Client.stopUnreadSync();
      await Client.logout();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      Alert.alert(errorText);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        error,
        isConnecting,
        login,
        client,
        logout,
        isConnected,
        sessionState,
        apiRegion: apiRegion.toLowerCase(),
        isGlobalBan,
        isVisitorUsageLimitReached,
        isVisitorOrBot,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContextProvider;
