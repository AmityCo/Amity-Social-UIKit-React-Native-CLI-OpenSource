// useSaveMediaMessageQuery — RN port of AmityUiKitWeb
// v4/chat/hooks/queries/useSaveMediaMessageQuery.ts. Saves a chat image/video to
// the device. Web resolves the file URL then triggers a browser download; RN
// resolves the same URL, downloads the bytes to a temp cache file
// (react-native-fs), and writes it into the photo gallery
// (@react-native-camera-roll/camera-roll). The URL-resolution logic ports verbatim;
// only the sink differs.
//
// RN adaptations vs web:
//   - Sink: CameraRoll.saveAsset instead of an <a download> click. Android <=28
//     needs WRITE_EXTERNAL_STORAGE (29+ saves via MediaStore with no permission);
//     iOS needs NSPhotoLibraryAddUsageDescription (Info.plist).
//   - Toasts route through useChatNotifications (the custom chat pill), matching
//     web's useNotifications('chat'). Same keys.

import { Platform, PermissionsAndroid } from 'react-native';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useMutation } from '@tanstack/react-query';
import RNFS from 'react-native-fs';

import { useString } from '../../../core/localization';
import { useChatNotifications } from '../useChatNotifications';

type MediaDataType = 'image' | 'video';

export type UseSaveMediaMessageQueryReturn = {
  requestSave: (message: Amity.Message) => void;
};

// Web resolveDownloadUrl, ported: image → large-sized fileUrl; video →
// original videoUrl, falling back to fileUrl.
async function resolveDownloadUrl(message: Amity.Message): Promise<string> {
  const data = message.data as { fileId?: string } | undefined;
  const fileId = data?.fileId;
  if (!fileId) throw new Error('Message has no fileId');

  const cached = await FileRepository.getFile(fileId);
  const file = cached.data;
  const fileUrl = file.fileUrl;

  if (message.dataType === 'image') {
    if (!fileUrl) throw new Error('Image file has no fileUrl');
    return FileRepository.fileUrlWithSize(fileUrl, 'large');
  }
  if (message.dataType === 'video') {
    const videoUrl = (file as Amity.File<'video'>).videoUrl;
    const resolved = videoUrl?.original ?? fileUrl;
    if (!resolved) throw new Error('Video file has no playable URL');
    return resolved;
  }
  throw new Error(`Unsupported dataType: ${String(message.dataType)}`);
}

function buildFilename(dataType: MediaDataType): string {
  const stamp = Date.now();
  return dataType === 'image' ? `image_${stamp}.jpg` : `video_${stamp}.mp4`;
}

// Android <=28 needs WRITE_EXTERNAL_STORAGE to write into the gallery; 29+ writes
// via MediaStore with no runtime permission. iOS permission is handled natively by
// CameraRoll (prompts on first save via NSPhotoLibraryAddUsageDescription).
async function ensureAndroidSavePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (typeof Platform.Version === 'number' && Platform.Version >= 29) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function saveToGallery(
  message: Amity.Message,
  dataType: MediaDataType
): Promise<void> {
  const granted = await ensureAndroidSavePermission();
  if (!granted) throw new Error('Storage permission denied');

  const url = await resolveDownloadUrl(message);
  const filename = buildFilename(dataType);
  // CameraRoll needs a local file on Android, so download the bytes to the app
  // cache (no permission needed) first, then hand the file:// path to CameraRoll.
  const localPath = `${RNFS.CachesDirectoryPath}/${filename}`;

  const download = RNFS.downloadFile({ fromUrl: url, toFile: localPath });
  const { statusCode } = await download.promise;
  if (statusCode !== 200) {
    throw new Error(`Download failed with status ${statusCode}`);
  }

  try {
    await CameraRoll.saveAsset(`file://${localPath}`, {
      type: dataType === 'image' ? 'photo' : 'video',
    });
  } finally {
    // Best-effort cleanup of the temp copy; ignore failures.
    RNFS.unlink(localPath).catch(() => undefined);
  }
}

export function useSaveMediaMessageQuery(): UseSaveMediaMessageQueryReturn {
  const { success, error } = useChatNotifications();
  const photoSuccessToast = useString('amity_chat_save_photo_success');
  const photoFailedToast = useString('amity_chat_save_photo_failed');
  const videoSuccessToast = useString('amity_chat_save_video_success');
  const videoFailedToast = useString('amity_chat_save_video_failed');

  const { mutate } = useMutation<
    { dataType: MediaDataType },
    Error,
    { message: Amity.Message }
  >({
    mutationFn: async ({ message }) => {
      const dataType = message.dataType;
      if (dataType !== 'image' && dataType !== 'video') {
        throw new Error(`Unsupported dataType: ${String(dataType)}`);
      }
      await saveToGallery(message, dataType);
      return { dataType };
    },
    onSuccess: ({ dataType }) => {
      success({
        content: dataType === 'image' ? photoSuccessToast : videoSuccessToast,
      });
    },
    onError: (_err, variables) => {
      const dataType = variables.message.dataType;
      if (dataType === 'image') error({ content: photoFailedToast });
      else if (dataType === 'video') error({ content: videoFailedToast });
    },
  });

  function requestSave(message: Amity.Message) {
    if (message.dataType !== 'image' && message.dataType !== 'video') return;
    mutate({ message });
  }

  return { requestSave };
}
