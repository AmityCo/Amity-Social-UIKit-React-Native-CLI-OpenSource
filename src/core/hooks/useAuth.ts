import { useContext } from 'react';

import { AuthContext } from '../providers/AuthProvider';
import type { AuthContextInterface } from '../types/auth';

const useAuth = (): AuthContextInterface => {
  const {
    login,
    logout,
    client,
    isConnecting,
    isConnected,
    error,
    sessionState,
    apiRegion,
    authToken,
    getAuthToken,
    fcmToken,
    isGlobalBan,
    isVisitorUsageLimitReached,
    isVisitorOrBot,
  } = useContext(AuthContext);

  return {
    error,
    login,
    client,
    logout,
    isConnecting,
    isConnected,
    sessionState,
    apiRegion,
    authToken,
    getAuthToken,
    fcmToken,
    isGlobalBan,
    isVisitorUsageLimitReached,
    isVisitorOrBot,
  };
};

export default useAuth;
