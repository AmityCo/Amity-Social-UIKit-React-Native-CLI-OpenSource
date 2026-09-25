// useCurrentUserId — RN convenience for the orchestrator. Web reads
// `useSDK().currentUserId`; RN reads it straight off the SDK client
// (`Client.getCurrentUser()?.userId`, the same pattern useConversation uses).
// Returns the current user's id, or undefined when no user is signed in.

import { Client } from '@amityco/ts-sdk-react-native';

export function useCurrentUserId(): string | undefined {
  return Client.getCurrentUser()?.userId;
}
