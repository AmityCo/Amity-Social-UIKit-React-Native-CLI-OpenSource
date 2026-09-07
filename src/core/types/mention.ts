export interface IMentionPosition {
  index: number;
  type: string;
  userId: string;
  length: number;
  displayName?: string;
}

export interface IDisplayImage {
  url: string;
  fileId: string | undefined;
  fileName: string;
  isUploaded: boolean;
  /** Stable local identity of a staged attachment, assigned once when the item
   * is created (picker asset id / original file name / capture path) and
   * carried unchanged through the upload. `url` and `fileName` are both
   * rewritten the moment the upload finishes — the url becomes the remote
   * `?size=medium` one and fileName becomes the SERVER's name — so neither can
   * identify an item across its own upload. Two defects come out of that:
   * de-duplicating a second pick against already-uploaded items compared local
   * names to server names and never matched, and the completion
   * handler had to fall back to the positional `index` it was rendered with,
   * which lands on the wrong entry once the array's composition has moved
   * underneath an in-flight upload. Optional because the legacy
   * EditPostModal builds these objects too. */
  localId?: string;
  /** The local file path the item was picked or captured from, kept for
   * DISPLAY only. `url` is replaced by the remote `?size=medium` url the
   * instant the upload finishes, so the composer frame stops rendering the
   * file on disk and starts fetching over the network — go offline and the
   * already-uploaded frame turns grey (PDT-5003), even though the local file
   * is still sitting there. Rendering from this instead keeps the frame
   * painted whatever the network is doing. Absent for edit-mode children,
   * which have no local file, so callers fall back to `url`. */
  localUrl?: string;
  /** The picker's original `asset.fileName` for a library pick, kept as the
   * secondary de-duplication key next to `localId`: `asset.id` is
   * only populated on some picker configurations, so the name is what catches
   * a re-pick when it is absent. Left unset for camera captures, whose temp
   * path is unique per shot and must never de-duplicate against anything. */
  localFileName?: string;
  thumbNail?: string;
  postId?: string;
  /** Source dimensions used to classify the composer frame ratio. For video
   * these are the STORED frame; `rotation` must be applied before classifying
   * (SelectedMediaComponent REQ-003d1, AmityVideo REQ-SDK-002). */
  width?: number;
  height?: number;
  rotation?: number;
}
