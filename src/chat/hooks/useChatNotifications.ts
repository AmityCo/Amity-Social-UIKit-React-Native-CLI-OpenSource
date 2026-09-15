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

import { useToast } from '../../core/stores/slices/toastSlice';

export type ChatNotificationOptions = {
  id?: number | string;
  content?: ReactNode;
  duration?: number;
  alignment?: string;
};

export type UseChatNotificationsReturn = {
  remove: (id?: ChatNotificationOptions['id']) => void;
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

// Mirrors the toast slice's `type` union (not exported from there).
type ToastType = 'failed' | 'success' | 'informative' | 'loading';

// Bottom offset for every chat toast: web's BASE rule
// `.chatToast { bottom: calc(var(--asc-keyboard-inset, 0px) + 3.5rem + 1rem) }`
// = 56px composer + 16px gap, so chat toasts clear the compose bar regardless of
// alignment (`[data-alignment='with-composer']` re-states the same value, and
// 'fullscreen' does not override bottom at all — that selector targets a different
// element). Added on top of the safe-area inset by the Toast.
const CHAT_TOAST_BOTTOM = 72;

export function useChatNotifications(): UseChatNotificationsReturn {
  const { showToast, hideToast } = useToast();

  // Every chat toast is raised above the compose bar, matching web's base
  // `.chatToast` bottom offset (see CHAT_TOAST_BOTTOM). PDT-5281: previously only
  // `alignment: 'with-composer'` was mapped and every other alignment fell back to
  // the app-wide 16px bottom, so chat toasts emitted with web's other alignments
  // (e.g. the block/unblock toasts, which web tags 'fullscreen') rendered on top of
  // the compose bar instead of above it. `alignment` stays accepted-and-ignored:
  // its remaining web values are desktop/sidebar layout concerns with no RN analog.
  const emit = (type: ToastType, data: ChatNotificationOptions) =>
    showToast({
      message: toMessage(data.content),
      type,
      duration: data.duration,
      variant: 'custom',
      bottomPosition: CHAT_TOAST_BOTTOM,
    });

  return {
    remove: () => hideToast(),
    success: (data) => emit('success', data),
    info: (data) => emit('informative', data),
    error: (data) => emit('failed', data),
    show: (data) => emit('informative', data),
    loading: (data) => emit('loading', data),
  };
}
