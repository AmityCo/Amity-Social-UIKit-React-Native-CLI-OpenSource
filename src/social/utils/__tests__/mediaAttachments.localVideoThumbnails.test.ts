import { toLocalVideoThumbnails } from '../mediaAttachments';

describe('toLocalVideoThumbnails', () => {
  it('keeps frames that have both an id and a decoded thumbnail', () => {
    expect(
      toLocalVideoThumbnails([
        { fileId: 'file-1', thumbNail: 'file:///thumb-1.jpg' },
        { fileId: 'file-2', thumbNail: 'file:///thumb-2.jpg' },
      ])
    ).toEqual([
      { fileId: 'file-1', thumbnailUrl: 'file:///thumb-1.jpg' },
      { fileId: 'file-2', thumbnailUrl: 'file:///thumb-2.jpg' },
    ]);
  });

  it('drops a frame whose thumbnail never resolved', () => {
    // The case behind the bug: a long video's server thumbnail does not exist
    // yet, so the composer has nothing to bridge with. Storing the row anyway
    // satisfies the feed's lookup and suppresses its pending state.
    expect(
      toLocalVideoThumbnails([
        { fileId: 'file-1', thumbNail: undefined },
        { fileId: 'file-2', thumbNail: '' },
        { fileId: 'file-3', thumbNail: 'file:///thumb-3.jpg' },
      ])
    ).toEqual([{ fileId: 'file-3', thumbnailUrl: 'file:///thumb-3.jpg' }]);
  });

  it('drops a frame with no fileId, which the feed could never match', () => {
    expect(
      toLocalVideoThumbnails([
        { fileId: undefined, thumbNail: 'file:///thumb.jpg' },
        { fileId: '', thumbNail: 'file:///thumb.jpg' },
      ])
    ).toEqual([]);
  });

  it('returns nothing for no videos', () => {
    expect(toLocalVideoThumbnails([])).toEqual([]);
  });
});
