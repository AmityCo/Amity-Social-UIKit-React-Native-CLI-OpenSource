import { PostRepository } from '@amityco/ts-sdk-react-native';
import {
  FETCH_POST_RETRY_DELAY_MS,
  FETCH_POST_TIMEOUT_MS,
  fetchPostOnce,
} from '../fetchPostOnce';

jest.mock('@amityco/ts-sdk-react-native', () => ({
  PostRepository: { getPost: jest.fn() },
}));

type Snapshot = { data?: unknown; loading: boolean; error?: unknown };
type Callback = (snapshot: Snapshot) => void;

const getPost = PostRepository.getPost as unknown as jest.Mock;
const post = { postId: 'child-1', dataType: 'image', data: { fileId: 'f1' } };

describe('fetchPostOnce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    getPost.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('waits for the settled answer, then unsubscribes', async () => {
    const unsubscribe = jest.fn();
    let callback: Callback = () => {};
    getPost.mockImplementation((_id: string, cb: Callback) => {
      callback = cb;
      return unsubscribe;
    });

    const result = fetchPostOnce('child-1');
    callback({ data: undefined, loading: true });
    expect(unsubscribe).not.toHaveBeenCalled();
    callback({ data: post, loading: false });

    await expect(result).resolves.toBe(post);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes when the SDK answers synchronously from its cache', async () => {
    const unsubscribe = jest.fn();
    getPost.mockImplementation((_id: string, cb: Callback) => {
      cb({ data: post, loading: false });
      return unsubscribe;
    });

    await expect(fetchPostOnce('child-1')).resolves.toBe(post);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('retries once after an error', async () => {
    const unsubscribe = jest.fn();
    getPost
      .mockImplementationOnce((_id: string, cb: Callback) => {
        cb({ loading: false, error: new Error('Network Error') });
        return unsubscribe;
      })
      .mockImplementationOnce((_id: string, cb: Callback) => {
        cb({ data: post, loading: false });
        return unsubscribe;
      });

    const result = fetchPostOnce('child-1');
    await Promise.resolve();
    jest.advanceTimersByTime(FETCH_POST_RETRY_DELAY_MS);

    await expect(result).resolves.toBe(post);
    expect(getPost).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it('gives up with undefined when the SDK never settles', async () => {
    const unsubscribe = jest.fn();
    getPost.mockImplementation(() => unsubscribe);

    const result = fetchPostOnce('child-1');
    jest.advanceTimersByTime(FETCH_POST_TIMEOUT_MS);
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(FETCH_POST_RETRY_DELAY_MS);
    await Promise.resolve();
    jest.advanceTimersByTime(FETCH_POST_TIMEOUT_MS);

    await expect(result).resolves.toBeUndefined();
    expect(getPost).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });
});
