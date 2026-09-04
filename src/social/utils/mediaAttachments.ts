import type { IDisplayImage } from '../../core/types';

/**
 * The composer caps a post at 10 attachments of a single media type
 * (PDT-4310 / PDT-4312).
 */
export const MAX_MEDIA_ATTACHMENTS = 10;

/**
 * The identity fields a staged attachment must carry for the helpers below to
 * recognise it across its own upload. See `IDisplayImage.localId`.
 */
export type MediaPickCandidate = IDisplayImage & {
  localId: string;
};

/**
 * Drop the candidates that are already staged, and any repeated inside the
 * batch itself, preserving the order of the ones that survive (PDT-5040).
 *
 * De-duplication runs against the LOCAL identity, never `fileName`: the moment
 * an item finishes uploading the composer rewrites its `fileName` to the
 * server's `attributes.name`, and edit-mode entries are hydrated with the
 * fileId, so a set built from `fileName` compares server-side names against
 * picker names and never matches. `localId` / `localFileName` are assigned once
 * at pick time and survive the upload, so they still line up here.
 *
 * `localFileName` is a second key next to `localId` because the picker's
 * `asset.id` is not populated by every configuration — the name is what catches
 * a re-pick when no id came back. Camera captures deliberately carry no
 * `localFileName`, so two shots never de-duplicate against each other.
 *
 * The drop is silent by design (no toast, no alert) and leaves the already
 * staged copy exactly where it is, which is what keeps a re-pick of A followed
 * by B and C rendering as A, B, C.
 */
export function dedupeMediaPicks<T extends MediaPickCandidate>(
  staged: IDisplayImage[],
  candidates: T[]
): T[] {
  const seenIds = new Set(
    staged.map((item) => item.localId).filter(Boolean) as string[]
  );
  const seenNames = new Set(
    staged.map((item) => item.localFileName).filter(Boolean) as string[]
  );

  const additions: T[] = [];
  for (const candidate of candidates) {
    const { localId, localFileName } = candidate;
    if (seenIds.has(localId)) continue;
    if (localFileName && seenNames.has(localFileName)) continue;
    seenIds.add(localId);
    if (localFileName) seenNames.add(localFileName);
    additions.push(candidate);
  }
  return additions;
}

/**
 * Append `additions` to `staged`, holding the 10-attachment cap.
 */
export function appendWithinCap(
  staged: IDisplayImage[],
  additions: IDisplayImage[]
): IDisplayImage[] {
  const updated = [...staged, ...additions];
  return updated.length > MAX_MEDIA_ATTACHMENTS
    ? updated.slice(0, MAX_MEDIA_ATTACHMENTS)
    : updated;
}

/**
 * Route a finished upload back to the entry it actually belongs to, matched by
 * the local path the child was mounted with (PDT-5003).
 *
 * The child reports both a positional `index` and the `originalPath`. The index
 * is the array position the frame was RENDERED at when the upload started —
 * LoadingVideo goes further and memoises its uploader on `[source]` alone, so
 * it freezes the index of the render where the source last changed. Writing
 * `data[index]` therefore lands on whatever now sits at that position: a frame
 * removed, an upload retried after the array grew, or a slow upload finishing
 * after its neighbours moved all put one file's remote url onto another file's
 * entry — which is what QA saw as an already-loaded image repainting with a
 * different picture once the network came back. Matching on `originalPath` is
 * exact: a not-yet-uploaded entry's `url` IS the local path its child was
 * handed, and pick de-duplication guarantees those are unique across the array.
 *
 * The patch is MERGED rather than replacing the entry: `localId` /
 * `localFileName` are what the next pick de-duplicates against (PDT-5040) and
 * what the carousel keys its frames by, and the picker's width/height still
 * classify the frame ratio — a wholesale replacement dropped all of them.
 *
 * No match means the entry is gone (closed mid-upload) or already finished, so
 * the array is returned untouched rather than resurrecting or double-writing.
 */
export function applyFinishedUpload(
  staged: IDisplayImage[],
  originalPath: string,
  patch: Partial<IDisplayImage>
): IDisplayImage[] {
  const targetIndex = staged.findIndex((item) => item.url === originalPath);
  if (targetIndex === -1) return staged;
  const updated = [...staged];
  updated[targetIndex] = { ...updated[targetIndex], ...patch };
  return updated;
}

/**
 * Add or remove a media item's `source` from the set of in-flight uploads
 * (PDT-5020).
 *
 * The composer gates Post/Save on this set being empty. It replaced a single
 * shared boolean that whichever upload finished FIRST flipped back to false on
 * behalf of every other frame, unlocking Post while the rest were still
 * uploading.
 *
 * Returns the same set instance when nothing changes, so a redundant report —
 * a child clearing on unmount right after `handleLoadEnd` already cleared —
 * does not trigger a re-render.
 */
export function toggleUploadingSource(
  uploading: Set<string>,
  source: string,
  isUploading: boolean
): Set<string> {
  if (isUploading === uploading.has(source)) return uploading;
  const updated = new Set(uploading);
  if (isUploading) {
    updated.add(source);
  } else {
    updated.delete(source);
  }
  return updated;
}
