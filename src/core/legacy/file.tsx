import { FileRepository, ContentFeedType } from '@amityco/ts-sdk-react-native';

import { Platform } from 'react-native';
import { appendFileToFormData } from '../utils/fileUpload';

/**
 * The rejection shape every uploader in this module throws.
 *
 * `LoadingImage` / `LoadingVideo` currently ignore the thrown value and show a
 * generic toast, so the contract is deliberately loose — but keeping one shape
 * means a caller that *does* want to branch (e.g. the `INVALID_IMAGE`
 * moderation case) can read `code` instead of sniffing strings.
 */
export type UploadError = {
  message: string;
  details?: string;
  code?: string;
  originalError?: unknown;
};

/**
 * Thrown when the SDK resolves without a payload. A 2xx with no `data` is still
 * a failed upload as far as the caller is concerned — the callers immediately
 * read `file[0]?.fileId`, so resolving `undefined` would only move the failure
 * somewhere less diagnosable.
 */
const NO_FILE_DATA_ERROR: UploadError = {
  message: 'Upload failed - no file data returned',
};

/**
 * Normalise whatever the SDK / networking layer threw into an `UploadError`.
 *
 * A dropped connection surfaces here as a plain `Error` ("Network request
 * failed") carrying no Amity error code — which is exactly the reported repro:
 * the user toggles the network off mid-upload and the request rejects.
 */
function toUploadError(error: any): UploadError {
  return {
    message: 'Upload failed',
    details:
      error?.message || "We couldn't complete your upload. Please try again.",
    originalError: error,
  };
}

/**
 * Every uploader below is a plain `async` function with try/catch,
 * NOT `new Promise(async (resolve, reject) => …)`.
 *
 * The old wrapper was actively harmful, not merely redundant. An `async`
 * executor returns a promise that `new Promise` neither awaits nor observes, so
 * anything the executor threw — and a mid-upload network drop makes
 * `FileRepository.upload*` throw — settled only that orphaned promise. The
 * outer promise stayed **pending forever**: `LoadingVideo.uploadFileToAmity`
 * sat awaiting it, its `catch` never ran, `handleLoadEnd()` was never called,
 * `loading` stayed `true`, and the frame kept spinning even after the
 * connection came back, so the tappable retry overlay was unreachable.
 *
 * Throwing from an `async` function has no such hole: a `throw` anywhere in the
 * body — including from code the function `await`ed — settles the promise it
 * returned. `uploadImageFile` already had the try/catch, which is
 * why the image path showed a failed state while the video path hung.
 */
export async function uploadFile(
  filePath: string,
  perCentCallback?: (percent: number) => void
): Promise<Amity.File<any>[]> {
  const formData = new FormData();
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  const fileType = Platform.OS === 'ios' ? 'image/jpeg' : 'image/jpg';

  let file: Amity.File<any>[] | undefined;

  try {
    appendFileToFormData(formData, 'files', filePath, fileName, fileType);

    ({ data: file } = await FileRepository.uploadFile(formData, (percent) => {
      perCentCallback && perCentCallback(percent);
    }));
  } catch (error: any) {
    throw toUploadError(error);
  }

  // Deliberately outside the try: an empty payload is not an exception to
  // re-wrap, and throwing it in here would round-trip it through
  // `toUploadError` and lose the specific message.
  if (!file) throw NO_FILE_DATA_ERROR;

  return file;
}

export async function uploadImageFile(
  filePath: string,
  perCentCallback?: (percent: number) => void
): Promise<Amity.File<'image'>[]> {
  const formData = new FormData();
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  const fileType = Platform.OS === 'ios' ? 'image/jpeg' : 'image/jpg';

  let file: Amity.File<'image'>[] | undefined;

  try {
    appendFileToFormData(formData, 'files', filePath, fileName, fileType);

    ({ data: file } = await FileRepository.uploadImage(formData, (percent) => {
      perCentCallback && perCentCallback(percent);
    }));
  } catch (error: any) {
    // Moderation rejects the image server-side; that is spelled out here
    // rather than folded into the generic "please try again" copy.
    if (
      error?.message?.includes('INVALID_IMAGE') ||
      error?.message?.includes('Inappropriate')
    ) {
      throw {
        message: 'Inappropriate image',
        details: 'Please choose a different image to upload.',
        code: 'INVALID_IMAGE',
      } as UploadError;
    }

    throw toUploadError(error);
  }

  if (!file) throw NO_FILE_DATA_ERROR;

  return file;
}

export async function uploadVideoFile(
  filePath: string,
  perCentCallback?: (percent: number) => void
): Promise<Amity.File<any>[]> {
  const formData = new FormData();
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];

  let file: Amity.File<any>[] | undefined;

  try {
    appendFileToFormData(formData, 'files', filePath, fileName, 'video/mp4');

    ({ data: file } = await FileRepository.uploadVideo(
      formData,
      ContentFeedType.POST,
      (percent) => {
        perCentCallback && perCentCallback(percent);
      }
    ));
  } catch (error: any) {
    throw toUploadError(error);
  }

  if (!file) throw NO_FILE_DATA_ERROR;

  return file;
}

export async function deleteAmityFile(
  fileId: string
): Promise<{ success: boolean }> {
  const reactionObject: Promise<{ success: boolean }> = new Promise(
    async (resolve, reject) => {
      try {
        const isFileDeleted = await FileRepository.deleteFile(fileId);
        resolve(isFileDeleted);
      } catch (error) {
        reject(error);
      }
    }
  );
  return reactionObject;
}
