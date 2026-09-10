// useMediaViewer — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useMediaViewer.
// Holds the open/closed state for the full-screen image viewer and video player,
// and derives the render-prop objects the ported ImageViewer / VideoPlayer
// components consume (src/chat/features/shared/components/{ImageViewer,VideoPlayer}).
//
// RN adaptations from web:
//   - `currentUserId` comes from `Client.getCurrentUser()` (via useCurrentUserId)
//     instead of web's `useSDK().currentUserId`.
//   - Delete goes through the RN `useDeleteMessageQuery` port, which confirms via
//     the platform `Alert` before deleting (web used ConfirmProvider's modal).
//     `afterDelete` closes the viewer, exactly as web does.
//   - Save goes through `useSaveMediaMessageQuery` (RN port), which downloads the
//     file and writes it to the device gallery via CameraRoll (web downloaded via
//     the browser). Same URL-resolution + success/error toasts.
// The return shape (UseMediaViewerReturn, ImageViewerRenderProps, VideoPlayerRenderProps)
// is preserved verbatim from web so useChatMessage can consume it unchanged.

import { useState } from 'react';

import { useCurrentUserId } from '../../../hooks/useCurrentUserId';
import {
  useDeleteMessageQuery,
  useSaveMediaMessageQuery,
} from '../../../hooks/queries';

type ImageView = {
  url: string;
  message: Amity.Message;
};

export type ImageViewerRenderProps = {
  src: string;
  onClose: () => void;
  isOwn: boolean;
  onDelete: () => void;
  onSave: () => void;
};

export type VideoPlayerRenderProps = {
  message: Amity.Message;
  onClose: () => void;
  isOwn: boolean;
  onDelete: () => void;
  onSave: () => void;
};

export type UseMediaViewerReturn = {
  openImageViewer: (url: string, message: Amity.Message) => void;
  openVideoPlayer: (message: Amity.Message) => void;
  imageViewerProps: ImageViewerRenderProps | null;
  videoPlayerProps: VideoPlayerRenderProps | null;
};

export function useMediaViewer(): UseMediaViewerReturn {
  const currentUserId = useCurrentUserId();
  const { requestSave } = useSaveMediaMessageQuery();
  const { requestDelete } = useDeleteMessageQuery();
  const [imageView, setImageView] = useState<ImageView | null>(null);
  const [videoMessage, setVideoMessage] = useState<Amity.Message | null>(null);

  function closeImageViewer() {
    setImageView(null);
  }

  function closeVideoPlayer() {
    setVideoMessage(null);
  }

  function openImageViewer(url: string, message: Amity.Message) {
    setImageView({ url, message });
  }

  function openVideoPlayer(message: Amity.Message) {
    setVideoMessage(message);
  }

  const imageViewerProps: ImageViewerRenderProps | null = imageView
    ? {
        src: imageView.url,
        onClose: closeImageViewer,
        isOwn: imageView.message.creatorId === currentUserId,
        onDelete: () =>
          requestDelete(imageView.message, { afterDelete: closeImageViewer }),
        onSave: () => requestSave(imageView.message),
      }
    : null;

  const videoPlayerProps: VideoPlayerRenderProps | null = videoMessage
    ? {
        message: videoMessage,
        onClose: closeVideoPlayer,
        isOwn: videoMessage.creatorId === currentUserId,
        onDelete: () =>
          requestDelete(videoMessage, { afterDelete: closeVideoPlayer }),
        onSave: () => requestSave(videoMessage),
      }
    : null;

  return {
    openImageViewer,
    openVideoPlayer,
    imageViewerProps,
    videoPlayerProps,
  };
}
