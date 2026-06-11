/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState, type FC } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import type { AuthContextInterface } from '../types/auth.interface';
import { Alert, Platform } from 'react-native';
import type { IAmityUIkitProvider } from './amity-ui-kit-provider';
import { ERROR_CODE } from '../v4/constants';

export const AuthContext = React.createContext<AuthContextInterface>({
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

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const handleConnect = useCallback(async () => {
    try {
      if (userId) {
        let loginParam: Amity.ConnectClientParams = {
          userId: userId,
          displayName: displayName, // optional
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

    // setupAmityVideoPlayer();

    if (fcmToken) {
      try {
        // await Client.registerPushNotification(fcmToken);
        // below is work around solution
        fetch(`${apiEndpoint}/v1/notification`, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId: generateUUID(),
            platform: Platform.OS,
            userId: userId,
            token: fcmToken,
          }),
        }).catch((err) => console.error(err));
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  const login = async () => {
    setError('');
    setLoading(true);
    try {
      handleConnect();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      setError(errorText);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setIsVisitorUsageLimitReached(false);
    login();
  }, [userId]);

  // TODO
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
