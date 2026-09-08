import { classifyPostChildren, type ResolvedPostChild } from '../postChildren';

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
 * A video child the server has accepted but has no file for yet. The child post
 * exists — it is in `children` and resolves — while `data` carries only what
 * the server already knows.
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

describe('classifyPostChildren — a child whose file fields have not arrived', () => {
  it('is the payload shape that used to crash', () => {
    const child = processingVideoChild('p1');

    // What the feed read before: the chain stopped at `data`, then took two
    // more hops unguarded. This is the throw the ErrorBoundary around the whole
    // UIKit caught, which is why the app showed its generic error page instead
    // of the feed.
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
