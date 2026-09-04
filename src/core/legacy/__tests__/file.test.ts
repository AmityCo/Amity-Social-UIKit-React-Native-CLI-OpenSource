import { uploadFile, uploadImageFile, uploadVideoFile } from '../file';

jest.mock('@amityco/ts-sdk-react-native', () => ({
  FileRepository: {
    uploadFile: jest.fn(),
    uploadImage: jest.fn(),
    uploadVideo: jest.fn(),
    deleteFile: jest.fn(),
  },
  ContentFeedType: { POST: 'post' },
}));

const { FileRepository } = require('@amityco/ts-sdk-react-native');

const PATH = 'file:///tmp/clip.mp4';

/**
 * Settle the call against a timer and report which won.
 *
 * This is the whole point of this suite: the bug was not a wrong error
 * message, it was a promise that NEVER SETTLED. `expect(...).rejects` would sit
 * there until Jest's own timeout and report a generic failure, so race the call
 * against a timer and assert on the winner — 'hung' is the regression.
 */
const settle = (promise: Promise<unknown>) =>
  Promise.race([
    promise.then(
      () => 'resolved' as const,
      () => 'rejected' as const
    ),
    new Promise<'hung'>((resolve) => setTimeout(() => resolve('hung'), 100)),
  ]);

const uploaders: [string, jest.Mock, () => Promise<unknown>][] = [
  ['uploadVideoFile', FileRepository.uploadVideo, () => uploadVideoFile(PATH)],
  ['uploadImageFile', FileRepository.uploadImage, () => uploadImageFile(PATH)],
  ['uploadFile', FileRepository.uploadFile, () => uploadFile(PATH)],
];

beforeEach(() => jest.clearAllMocks());

describe.each(uploaders)('%s (PDT-5019)', (_name, sdkMethod, call) => {
  it('rejects instead of hanging when the network drops mid-upload', async () => {
    // What a dropped connection actually looks like coming out of the SDK.
    sdkMethod.mockRejectedValue(new Error('Network request failed'));

    await expect(settle(call())).resolves.toBe('rejected');
  });

  it('rejects instead of hanging when the SDK resolves with no payload', async () => {
    sdkMethod.mockResolvedValue({ data: undefined });

    await expect(settle(call())).resolves.toBe('rejected');
  });

  it('resolves with the uploaded files on success', async () => {
    const files = [{ fileId: 'f1', fileUrl: 'https://cdn/f1' }];
    sdkMethod.mockResolvedValue({ data: files });

    await expect(call()).resolves.toBe(files);
  });

  it('reports upload progress through to the caller', async () => {
    sdkMethod.mockImplementation((...args: unknown[]) => {
      // uploadVideo takes (formData, feedType, cb); the others (formData, cb).
      const cb = args.find((arg) => typeof arg === 'function') as (
        percent: number
      ) => void;
      cb(42);
      return Promise.resolve({ data: [{ fileId: 'f1' }] });
    });

    const onProgress = jest.fn();
    await (_name === 'uploadVideoFile'
      ? uploadVideoFile(PATH, onProgress)
      : _name === 'uploadImageFile'
      ? uploadImageFile(PATH, onProgress)
      : uploadFile(PATH, onProgress));

    expect(onProgress).toHaveBeenCalledWith(42);
  });
});

describe('rejection shape', () => {
  it('carries the underlying message so callers can diagnose', async () => {
    FileRepository.uploadVideo.mockRejectedValue(
      new Error('Network request failed')
    );

    await expect(uploadVideoFile(PATH)).rejects.toMatchObject({
      message: 'Upload failed',
      details: 'Network request failed',
    });
  });

  it('keeps the specific message when the SDK returns no data', async () => {
    FileRepository.uploadVideo.mockResolvedValue({ data: undefined });

    await expect(uploadVideoFile(PATH)).rejects.toMatchObject({
      message: 'Upload failed - no file data returned',
    });
  });

  it('still flags moderation rejections as INVALID_IMAGE (PDT-4997)', async () => {
    FileRepository.uploadImage.mockRejectedValue(
      new Error('INVALID_IMAGE: Inappropriate content')
    );

    await expect(uploadImageFile(PATH)).rejects.toMatchObject({
      code: 'INVALID_IMAGE',
      message: 'Inappropriate image',
    });
  });
});
