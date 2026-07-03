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
      setIsVisitorOrBot(Client.getCurrentUserType() !== 'signed-in');
    }
  }, [sessionState]);

  useEffect(() => {
    const unsubscribe = Client.onVisitorUsageLimitReached(() => {
      setIsVisitorUsageLimitReached(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      if (userId) {
        // Spec: omit displayName entirely when blank — do not substitute userId
        let loginParam: Amity.ConnectClientParams = { userId: userId };
        if (displayName) loginParam = { ...loginParam, displayName };
        if (authToken?.length > 0) {
          loginParam = { ...loginParam, authToken: authToken };
        }
        const response = await Client.login(loginParam, sessionHandler);
        if (!response) return;
      } else {
        const response = await Client.loginAsVisitor({ sessionHandler });
        if (!response) return;
      }
    } catch (err) {
      if (err?.message?.includes(ERROR_CODE.GLOBAL_BAN)) {
        setIsGlobalBan(true);
      }
    }

    // Visitors/bots are GET-only with no MQTT — skip push registration for them.
    if (fcmToken && userId) {
      try {
        await Client.registerPushNotification(fcmToken);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

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
