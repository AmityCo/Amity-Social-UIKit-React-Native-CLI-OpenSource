// useVideoFileUrl — resolve an SDK video fileId to its RAW playable URL.
// The shared `useFile` hook always runs `fileUrlWithSize`, which is an image-CDN
// transform; for video we need the untouched `fileUrl` (the same source string the
// existing RN VideoFeed/VideoPlayer screens feed to react-native-video). Mirrors web
// VideoPlayer/VideoBubble, which read `video?.fileUrl` directly.

import { useEffect, useState } from 'react';
import { FileRepository } from '@amityco/ts-sdk-react-native';

export function useVideoFileUrl(fileId?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!fileId) {
        setUrl(undefined);
        return;
      }
      const file = await FileRepository.getFile(fileId);
      if (cancelled || !file) return;
      setUrl(file.data.fileUrl);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  return url;
}
