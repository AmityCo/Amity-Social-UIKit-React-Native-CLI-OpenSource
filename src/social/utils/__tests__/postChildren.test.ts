import {
  childIdsToRecheck,
  classifyPostChildren,
  mergeFreshChildren,
  type LoadedPostChild,
  type ResolvedPostChild,
} from '../postChildren';

const REGION = 'sg';

const videoChild = (
  original: string,
  postId = original
): ResolvedPostChild => ({
  post: { postId } as Amity.Post,
  dataType: 'video',
  data: {
    videoFileId: { original },
    thumbnailFileId: `${original}-thumb`,
  },
});

/**
 * A video child whose payload has no reachable `original` size. `videoFileId`
 * is typed as always present, so this shape stands for the wider class of
 * incomplete payloads rather than for one the server is known to send.
 */
const processingVideoChild = (postId: string): ResolvedPostChild => ({
  post: { postId } as Amity.Post,
  dataType: 'video',
  data: { thumbnailFileId: undefined },
});

const imageChild = (fileId: string, postId = fileId): ResolvedPostChild => ({
  post: { postId } as Amity.Post,
  dataType: 'image',
  data: { fileId },
});

describe('classifyPostChildren — a child with an incomplete payload', () => {
  it('is the payload shape that used to crash', () => {
    const child = processingVideoChild('p1');

    // What the feed read before: the chain stopped at `data`, then took two
    // more hops unguarded. Pins down what such a payload costs — a TypeError
    // that the app-wide ErrorBoundary turns into a full-screen error page —
    // without claiming the server sends this shape.
    expect(() => (child.data as any).videoFileId.original).toThrow(TypeError);
  });

  it('does not throw, and leaves the resolved videos untouched', () => {
    const children = [
      videoChild('v1'),
      videoChild('v2'),
      videoChild('v3'),
      processingVideoChild('v4'),
    ];

    const result = classifyPostChildren(children, REGION);

    expect(result.videos.map((v) => v.videoFileId.original)).toEqual([
      'v1',
      'v2',
      'v3',
    ]);
  });

  it('tolerates a videoFileId with no original', () => {
    const children: ResolvedPostChild[] = [
      { post: { postId: 'p' } as Amity.Post, dataType: 'video', data: {} },
      {
        post: { postId: 'q' } as Amity.Post,
        dataType: 'video',
        data: { videoFileId: {} },
      },
      { post: { postId: 'r' } as Amity.Post, dataType: 'video' },
    ];

    expect(() => classifyPostChildren(children, REGION)).not.toThrow();
    expect(classifyPostChildren(children, REGION).videos).toEqual([]);
  });

  it('tolerates poll and livestream children with no payload', () => {
    const children: ResolvedPostChild[] = [
      { post: { postId: 'a' } as Amity.Post, dataType: 'poll' },
      { post: { postId: 'b' } as Amity.Post, dataType: 'poll', data: {} },
      { post: { postId: 'c' } as Amity.Post, dataType: 'room' },
      { post: { postId: 'd' } as Amity.Post, dataType: 'room', data: {} },
    ];

    expect(() => classifyPostChildren(children, REGION)).not.toThrow();
    const result = classifyPostChildren(children, REGION);
    expect(result.polls).toEqual([]);
    expect(result.livestreams).toEqual([]);
  });
});

describe('classifyPostChildren — media and videos stay index-aligned', () => {
  // The full-screen player is built from `videos` but opened with an index
  // taken from `media`, so a child counted in one and not the other opens the
  // wrong video.
  it('drops a child from both lists or from neither', () => {
    const children = [
      videoChild('v1'),
      processingVideoChild('v2'),
      videoChild('v3'),
    ];

    const { videos, media } = classifyPostChildren(children, REGION);

    expect(videos).toHaveLength(media.length);
    expect(media.map((post) => post.postId)).toEqual(['v1', 'v3']);
    expect(videos.map((v) => v.videoFileId.original)).toEqual(['v1', 'v3']);
  });

  it('keeps every frame of a fully resolved post', () => {
    const children = [videoChild('v1'), videoChild('v2'), videoChild('v3')];

    const { videos, media } = classifyPostChildren(children, REGION);

    expect(videos).toHaveLength(3);
    expect(media.map((post) => post.postId)).toEqual(['v1', 'v2', 'v3']);
  });
});

describe('classifyPostChildren — de-duplication is preserved', () => {
  it('de-duplicates videos by their original file id', () => {
    const children = [videoChild('v1', 'first'), videoChild('v1', 'second')];

    const { videos, media } = classifyPostChildren(children, REGION);

    expect(videos).toHaveLength(1);
    expect(media.map((post) => post.postId)).toEqual(['first']);
  });

  it('de-duplicates images by their download url', () => {
    const children = [imageChild('i1', 'first'), imageChild('i1', 'second')];

    const { images, media } = classifyPostChildren(children, REGION);

    expect(images).toEqual([
      `https://api.${REGION}.amity.co/api/v3/files/i1/download?size=medium`,
    ]);
    expect(media.map((post) => post.postId)).toEqual(['first']);
  });

  it('skips an image child with no fileId instead of throwing', () => {
    const children: ResolvedPostChild[] = [
      { post: { postId: 'a' } as Amity.Post, dataType: 'image', data: {} },
      imageChild('i1'),
    ];

    const { images, media } = classifyPostChildren(children, REGION);

    expect(images).toHaveLength(1);
    expect(media.map((post) => post.postId)).toEqual(['i1']);
  });
});

describe('childIdsToRecheck', () => {
  const loaded = (
    id: string,
    child: ResolvedPostChild = {}
  ): LoadedPostChild => ({ id, ...child });

  it('picks a video whose thumbnail the server has not made yet', () => {
    expect(
      childIdsToRecheck([
        loaded('v1', processingVideoChild('v1')),
        loaded('v2', videoChild('v2')),
      ])
    ).toEqual(['v1']);
  });

  it('picks a video whose thumbnail id is set but whose file is not there yet', () => {
    const video = (fileUrl?: string): LoadedPostChild => ({
      id: 'v1',
      post: {
        postId: 'v1',
        getVideoThumbnailInfo: () => (fileUrl ? { fileUrl } : undefined),
      } as unknown as Amity.Post,
      dataType: 'video',
      data: {
        videoFileId: { original: 'v1' },
        thumbnailFileId: 'v1_thumbnail.0000001',
      },
    });

    expect(childIdsToRecheck([video()])).toEqual(['v1']);
    expect(childIdsToRecheck([video('https://cdn/v1-thumb')])).toEqual([]);
  });

  it('picks a child that could not be read', () => {
    expect(childIdsToRecheck([loaded('gone')])).toEqual(['gone']);
  });

  it('leaves images, polls and finished videos alone', () => {
    expect(
      childIdsToRecheck([
        loaded('i1', imageChild('i1')),
        loaded('p1', {
          post: { postId: 'p1' } as Amity.Post,
          dataType: 'poll',
          data: { pollId: 'poll-1' },
        }),
        loaded('v2', videoChild('v2')),
      ])
    ).toEqual([]);
  });
});

describe('mergeFreshChildren', () => {
  it('swaps in the fresh copy and keeps the order', () => {
    const children: LoadedPostChild[] = [
      { id: 'i1', ...imageChild('i1') },
      { id: 'v1', ...processingVideoChild('v1') },
    ];
    const fresh = {
      postId: 'v1',
      dataType: 'video',
      data: { videoFileId: { original: 'v1' }, thumbnailFileId: 'v1-thumb' },
    } as unknown as Amity.Post;

    const merged = mergeFreshChildren(children, [fresh]);

    expect(merged.map(({ id }) => id)).toEqual(['i1', 'v1']);
    expect(merged[0]).toBe(children[0]);
    expect(merged[1].data?.thumbnailFileId).toBe('v1-thumb');
    expect(childIdsToRecheck(merged)).toEqual([]);
  });

  it('keeps a child the fresh read did not return', () => {
    const children: LoadedPostChild[] = [{ id: 'gone' }];
    expect(mergeFreshChildren(children, [])).toEqual(children);
  });
});
