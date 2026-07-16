export type AuthContextInterface = {
  error: string;
  isConnecting: boolean;
  logout: () => void;
  client?: Amity.Client;
  login: () => void;
  isConnected: boolean;
  sessionState: string;
  apiRegion: string;
  authToken?: string;
  /**
   * Secure-mode auth-token provider set once on AmityUiKitProvider. Exposed
   * here so pages that perform their own login (e.g. the Create Profile page)
   * can reuse it without the host passing it again.
   */
  getAuthToken?: (userId: string) => Promise<string> | string;
  fcmToken?: string;
  isGlobalBan: boolean;
  isVisitorUsageLimitReached: boolean;
  isVisitorOrBot: boolean;
};
