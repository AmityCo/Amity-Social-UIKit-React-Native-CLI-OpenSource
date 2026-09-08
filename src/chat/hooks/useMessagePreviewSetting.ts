// useMessagePreviewSetting — exposes the network-level chat message-preview
// setting (`/api/v3/network-settings/chat` → `messagePreview`) to the UI.
//
// `Client.getChatSettings()` is a network call, so the result is memoised at
// module scope: the chat list renders one row per channel and every row needs
// the same answer. The network setting is per-network (not per-user), so a
// single shared value is correct for the whole session.
//
// Both fields stay `undefined` until the fetch resolves (and on failure), which
// lets callers keep the safe default rather than guessing.

import { useEffect, useState } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import useAuth from '../../core/hooks/useAuth';

export type MessagePreviewSetting = {
  /** Network `messagePreview.enabled`. */
  isEnabled?: boolean;
  /** Network `messagePreview.isIncludeDeleted`. */
  isIncludeDeleted?: boolean;
};

const EMPTY: MessagePreviewSetting = {};

let cachedSetting: MessagePreviewSetting | undefined;
let pendingSetting: Promise<MessagePreviewSetting> | undefined;

function fetchMessagePreviewSetting(): Promise<MessagePreviewSetting> {
  if (!pendingSetting) {
    pendingSetting = Client.getChatSettings()
      .then((settings) => {
        cachedSetting = {
          isEnabled: settings.messagePreview.enabled,
          isIncludeDeleted: settings.messagePreview.isIncludeDeleted,
        };
        return cachedSetting;
      })
      .catch(() => {
        // Allow a later mount to retry.
        pendingSetting = undefined;
        return EMPTY;
      });
  }
  return pendingSetting;
}

export function useMessagePreviewSetting(): MessagePreviewSetting {
  const { isConnected } = useAuth();
  const [setting, setSetting] = useState<MessagePreviewSetting>(
    () => cachedSetting ?? EMPTY
  );

  useEffect(() => {
    if (!isConnected || cachedSetting) {
      if (cachedSetting) setSetting(cachedSetting);
      return undefined;
    }

    let active = true;
    fetchMessagePreviewSetting().then((next) => {
      if (active) setSetting(next);
    });

    return () => {
      active = false;
    };
  }, [isConnected]);

  return setting;
}
