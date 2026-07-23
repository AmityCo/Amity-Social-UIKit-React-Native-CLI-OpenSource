// useChatNotifications — RN adapter mirroring AmityUiKitWeb's `useNotifications('chat')`.
//
// Web routes chat notifications to a custom dark-pill Toast. RN has a real toast
// system (the redux `toastSlice` + the global `<Toast />` mounted in the provider /
// navigators). This hook maps web's notification API onto that system, dispatching
// with `variant: 'custom'` so chat toasts render as the dark pill (bound to the
// CustomToast design tokens) rather than the app-wide default toast.
//
// The surface preserves web's `{ remove, success, info, error, show, loading }`
// so every existing consumer (useBubbleMenu / useChatMessage / group + user action
// components) keeps working unchanged.
//
// RN adaptations vs web:
//   - web's `alignment` (fullscreen | withSidebar | with-composer | live-chat) is a
//     web-layout concern with no RN equivalent; it is accepted and ignored.
//   - web keyed toasts by `id` (multiple stacked toasts). The RN slice is a singleton,
//     so `remove` hides the current toast and `id` is accepted but unused.

import type { ReactNode } from 'react';

import { useToast } from '../../../../core/stores/slices/toastSlice';

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

// Callers pass `content` as a resolved localization string (ReactNode in the type).
// Coerce to the plain string the toast slice renders.
function toMessage(content: ChatNotificationOptions['content']): string {
  return typeof content === 'string'
    ? content
    : content == null
    ? ''
    : String(content);
}

export function useChatNotifications(): UseChatNotificationsReturn {
  const { showToast, hideToast } = useToast();

  return {
    remove: () => hideToast(),
    success: ({ content, duration }) =>
      showToast({
        message: toMessage(content),
        type: 'success',
        duration,
        variant: 'custom',
      }),
    info: ({ content, duration }) =>
      showToast({
        message: toMessage(content),
        type: 'informative',
        duration,
        variant: 'custom',
      }),
    error: ({ content, duration }) =>
      showToast({
        message: toMessage(content),
        type: 'failed',
        duration,
        variant: 'custom',
      }),
    show: ({ content, duration }) =>
      showToast({
        message: toMessage(content),
        type: 'informative',
        duration,
        variant: 'custom',
      }),
    loading: ({ content, duration }) =>
      showToast({
        message: toMessage(content),
        type: 'loading',
        duration,
        variant: 'custom',
      }),
  };
}
