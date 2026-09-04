import type { IDisplayImage } from '../../../core/types';
import {
  MAX_MEDIA_ATTACHMENTS,
  appendWithinCap,
  applyFinishedUpload,
  dedupeMediaPicks,
  toggleUploadingSource,
} from '../mediaAttachments';

/** A freshly picked, not-yet-uploaded attachment. */
const picked = (
  name: string,
  overrides: Partial<IDisplayImage> = {}
): IDisplayImage & { localId: string } => ({
  url: `file:///tmp/pick-${name}.jpg`,
  fileName: name,
  localId: name,
  localFileName: name,
  fileId: '',
  isUploaded: false,
  ...overrides,
});

/**
 * The same attachment after its upload finished: the composer rewrites `url`
 * to the remote one and `fileName` to the SERVER's name. Only the local
 * identity survives — which is the whole point of these two fixes.
 */
const uploaded = (name: string, serverName: string): IDisplayImage => ({
  ...picked(name),
  url: `https://cdn.amity.co/${serverName}?size=medium`,
  fileName: serverName,
  fileId: `file-${serverName}`,
  isUploaded: true,
});

describe('dedupeMediaPicks (PDT-5040)', () => {
  it('drops a re-picked asset whose staged copy has already uploaded', () => {
    // The exact QA repro: pick A, let it upload, then pick A, B, C.
    const staged = [uploaded('A', 'server-generated-name-A')];

    const additions = dedupeMediaPicks(staged, [
      picked('A'),
      picked('B'),
      picked('C'),
    ]);

    expect(additions.map((item) => item.localId)).toEqual(['B', 'C']);
  });

  it('leaves the staged copy in place so order stays A, B, C', () => {
    const staged = [uploaded('A', 'server-generated-name-A')];

    const result = appendWithinCap(
      staged,
      dedupeMediaPicks(staged, [picked('A'), picked('B'), picked('C')])
    );

    expect(result).toHaveLength(3);
    expect(result.map((item) => item.localId)).toEqual(['A', 'B', 'C']);
    // The already-staged entry is untouched — not removed, not re-added.
    expect(result[0]).toBe(staged[0]);
  });

  it('would NOT have caught the duplicate by fileName alone', () => {
    // Guards the regression directly: the old key compared the picker's name
    // against the server's, which never matched.
    const staged = [uploaded('A', 'server-generated-name-A')];
    expect(staged[0].fileName).not.toBe(picked('A').fileName);
  });

  it('de-duplicates by localFileName when the picker returns no asset id', () => {
    // `asset.id` is unset on some picker configurations, so localId falls back
    // to the file name — but a staged item may carry a different fallback.
    const staged = [
      uploaded('photo.jpg', 'server-name'),
      // An entry whose localId came from an asset id, sharing the file name.
      { ...picked('photo.jpg'), localId: 'ph-asset-42' },
    ];

    const additions = dedupeMediaPicks(staged, [picked('photo.jpg')]);

    expect(additions).toEqual([]);
  });

  it('de-duplicates within a single pick batch', () => {
    const additions = dedupeMediaPicks(
      [],
      [picked('A'), picked('A'), picked('B')]
    );

    expect(additions.map((item) => item.localId)).toEqual(['A', 'B']);
  });

  it('never de-duplicates camera captures, which carry no localFileName', () => {
    // Two shots of the same scene are two distinct attachments.
    const shotOne = {
      ...picked('shot'),
      localId: 'file:///tmp/capture-1.jpg',
      localFileName: undefined,
    };
    const shotTwo = {
      ...picked('shot'),
      localId: 'file:///tmp/capture-2.jpg',
      localFileName: undefined,
    };

    expect(dedupeMediaPicks([shotOne], [shotTwo])).toEqual([shotTwo]);
  });

  it('ignores legacy entries that carry no local identity at all', () => {
    const legacy = {
      ...picked('A'),
      localId: undefined,
      localFileName: undefined,
    };
    const additions = dedupeMediaPicks(
      [legacy as IDisplayImage],
      [picked('B')]
    );

    expect(additions.map((item) => item.localId)).toEqual(['B']);
  });
});

describe('appendWithinCap', () => {
  it('holds the 10-attachment cap', () => {
    const staged = Array.from({ length: 8 }, (_, i) => picked(`s${i}`));
    const additions = Array.from({ length: 5 }, (_, i) => picked(`a${i}`));

    const result = appendWithinCap(staged, additions);

    expect(result).toHaveLength(MAX_MEDIA_ATTACHMENTS);
    expect(result[9].localId).toBe('a1');
  });
});

describe('applyFinishedUpload (PDT-5003)', () => {
  const remote = {
    url: 'https://cdn.amity.co/remote-A?size=medium',
    fileId: 'file-A',
    fileName: 'server-generated-name-A',
    isUploaded: true,
  };

  it('writes to the entry that owns the path, not to a shifted index', () => {
    // A was at index 0 when its upload started; the user then removed it and
    // B slid into index 0. The old `newData[index] = …` painted A's remote url
    // onto B — the wrong-thumbnail bug.
    const staged = [picked('B'), picked('C')];

    const result = applyFinishedUpload(staged, picked('A').url, remote);

    expect(result).toBe(staged); // no match → untouched
    expect(result[0].url).toBe(picked('B').url);
  });

  it('routes a completion to its own entry when positions moved', () => {
    const staged = [picked('B'), picked('A'), picked('C')];

    const result = applyFinishedUpload(staged, picked('A').url, remote);

    expect(result[1].url).toBe(remote.url);
    expect(result[1].fileId).toBe('file-A');
    // Neighbours are untouched.
    expect(result[0]).toBe(staged[0]);
    expect(result[2]).toBe(staged[2]);
  });

  it('preserves the local identity so the next pick still de-duplicates', () => {
    const staged = [picked('A')];

    const result = applyFinishedUpload(staged, picked('A').url, remote);

    expect(result[0].localId).toBe('A');
    expect(result[0].localFileName).toBe('A');
    // And the merged entry is now recognised as a duplicate of a re-pick.
    expect(dedupeMediaPicks(result, [picked('A')])).toEqual([]);
  });

  it('preserves picker dimensions used to classify the frame ratio', () => {
    const staged = [picked('A', { width: 1080, height: 1920 })];

    const result = applyFinishedUpload(staged, picked('A').url, remote);

    expect(result[0].width).toBe(1080);
    expect(result[0].height).toBe(1920);
  });

  it('does not resurrect a frame removed mid-upload', () => {
    const result = applyFinishedUpload([], picked('A').url, remote);
    expect(result).toEqual([]);
  });
});

describe('toggleUploadingSource (PDT-5020)', () => {
  it('stays non-empty until every upload has finished', () => {
    // Three videos picked; the first to finish must not unlock Post.
    let uploading = new Set<string>();
    for (const source of ['a', 'b', 'c']) {
      uploading = toggleUploadingSource(uploading, source, true);
    }
    expect(uploading.size).toBe(3);

    uploading = toggleUploadingSource(uploading, 'b', false);
    expect(uploading.size).toBeGreaterThan(0); // Post still gated

    uploading = toggleUploadingSource(uploading, 'a', false);
    uploading = toggleUploadingSource(uploading, 'c', false);
    expect(uploading.size).toBe(0); // now, and only now, Post unlocks
  });

  it('returns the same set when nothing changes, so no re-render is forced', () => {
    const uploading = new Set(['a']);

    // A child clearing on unmount right after handleLoadEnd already cleared.
    expect(toggleUploadingSource(uploading, 'b', false)).toBe(uploading);
    expect(toggleUploadingSource(uploading, 'a', true)).toBe(uploading);
  });

  it('does not mutate the set it is given', () => {
    const uploading = new Set(['a']);
    const next = toggleUploadingSource(uploading, 'b', true);

    expect(uploading).toEqual(new Set(['a']));
    expect(next).toEqual(new Set(['a', 'b']));
  });
});
