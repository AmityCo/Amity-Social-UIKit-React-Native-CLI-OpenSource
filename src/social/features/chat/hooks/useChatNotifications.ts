// useChatNotifications — RN adapter mirroring AmityUiKitWeb's `useNotifications('chat')`.
//
// STUB: RN has no toast/notification provider yet. Web's NotificationProvider
// renders in-app toasts; here every method is a no-op (routed to console in
// __DEV__ for visibility) so the ported chat hooks (useBubbleMenu, useChatMessage,
// …) can call `loading` / `remove` / `error` / `success` unchanged. Replace the
// body with a real toast provider later without touching consumers.
//
// The surface preserves web's `{ remove, success, info, error, show, loading }`.
// useChatMessage uses `loading` / `remove` / `error`; useBubbleMenu uses `success`.

import type { ReactNode } from 'react';

export type ChatNotificationOptions = {
  id?: number | string;
  content?: ReactNode;
  duration?: number;
  alignment?: string;
};

export type UseChatNotificationsReturn = {
  remove: (id: ChatNotificationOptions['id']) => void;
  success: (data: ChatNotificationOptions) => void;
  info: (data: ChatNotificationOptions) => void;
  error: (data: ChatNotificationOptions) => void;
  show: (data: ChatNotificationOptions) => void;
  loading: (data: ChatNotificationOptions) => void;
};

function noop(_data?: unknown) {
  // Intentional no-op stub. Real toasts will replace this.
  if (__DEV__) {
    console.debug('[useChatNotifications:stub]', _data);
  }
}

export function useChatNotifications(): UseChatNotificationsReturn {
  return {
    remove: noop,
    success: noop,
    info: noop,
    error: noop,
    show: noop,
    loading: noop,
  };
}
