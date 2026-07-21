// useMediaViewer — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useMediaViewer.
// Holds the open/closed state for the full-screen image viewer and video player,
// and derives the render-prop objects the ported ImageViewer / VideoPlayer
// components consume (src/social/features/chat/features/shared/components/{ImageViewer,VideoPlayer}).
//
// RN adaptations from web:
//   - `currentUserId` comes from `Client.getCurrentUser()` (via useCurrentUserId)
//     instead of web's `useSDK().currentUserId`.
//   - Delete goes through the existing RN `useDeleteMessage` mutation rather than
//     web's `useDeleteMessageQuery`. There is no ConfirmProvider in RN, so delete
//     is issued directly (web showed a confirm dialog first) — documented deviation.
//   - Save has no RN infra yet (web's `useSaveMediaMessageQuery` downloads via the
//     browser). `onSave` is a documented stub; real media-save lands later.
// The return shape (UseMediaViewerReturn, ImageViewerRenderProps, VideoPlayerRenderProps)
// is preserved verbatim from web so useChatMessage can consume it unchanged.

import { useState } from 'react';

import { useDeleteMessage } from '../../../hooks/useDeleteMessage';
import { useCurrentUserId } from '../../../hooks/useCurrentUserId';

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
  const [imageView, setImageView] = useState<ImageView | null>(null);
  const [videoMessage, setVideoMessage] = useState<Amity.Message | null>(null);

  function closeImageViewer() {
    setImageView(null);
  }

  function closeVideoPlayer() {
    setVideoMessage(null);
  }

  const { deleteMessage } = useDeleteMessage({
    onSuccess: () => {
      closeImageViewer();
      closeVideoPlayer();
    },
  });

  function openImageViewer(url: string, message: Amity.Message) {
    setImageView({ url, message });
  }

  function openVideoPlayer(message: Amity.Message) {
    setVideoMessage(message);
  }

  function requestSave(_message: Amity.Message) {
    // TODO: no RN media-save infra yet (web downloaded via the browser). Stubbed.
  }

  const imageViewerProps: ImageViewerRenderProps | null = imageView
    ? {
        src: imageView.url,
        onClose: closeImageViewer,
        isOwn: imageView.message.creatorId === currentUserId,
        onDelete: () => {
          if (imageView.message.messageId) {
            deleteMessage(imageView.message.messageId);
          }
        },
        onSave: () => requestSave(imageView.message),
      }
    : null;

  const videoPlayerProps: VideoPlayerRenderProps | null = videoMessage
    ? {
        message: videoMessage,
        onClose: closeVideoPlayer,
        isOwn: videoMessage.creatorId === currentUserId,
        onDelete: () => {
          if (videoMessage.messageId) {
            deleteMessage(videoMessage.messageId);
          }
        },
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
