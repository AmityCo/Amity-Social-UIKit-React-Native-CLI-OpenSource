import { FileRepository, ContentFeedType } from '@amityco/ts-sdk-react-native';

import NetInfo from '@react-native-community/netinfo';
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
 * Thrown before an attempt is even made when the device has no connection.
 *
 * Rejecting up front is not belt-and-braces — on iOS it is the only thing that
 * produces a failure at all. Android's networking stack rejects an offline
 * request almost immediately, so the uploaders' `catch` ran and the frame
 * showed its error state; NSURLSession instead sits on the request waiting for
 * connectivity, so the promise never settled, the `catch` never ran, and the
 * frame stayed on its spinner forever with no way to reach the failed state
 * The spec asks for an error state per attachment that failed to upload,
 * whatever the platform.
 */
const OFFLINE_ERROR: UploadError = {
  message: 'Upload failed - no internet connection',
  code: 'OFFLINE',
};

/**
 * Reject immediately when there is no connection, rather than handing the
 * request to a networking stack that may never answer.
 *
 * Only covers being offline as the attempt STARTS. A connection dropped
 * mid-upload still leaves iOS waiting, because nothing here can abort a
 * request already inside the SDK — the composer's reconnect retry is what
 * eventually recovers that case.
 */
async function assertOnline(): Promise<void> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) throw OFFLINE_ERROR;
}

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

  await assertOnline();

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

  await assertOnline();

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

  await assertOnline();

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
