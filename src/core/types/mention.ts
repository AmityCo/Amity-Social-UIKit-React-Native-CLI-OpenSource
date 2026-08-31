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
  thumbNail?: string;
  postId?: string;
  /** Source dimensions used to classify the composer frame ratio. For video
   * these are the STORED frame; `rotation` must be applied before classifying
   * (SelectedMediaComponent REQ-003d1, AmityVideo REQ-SDK-002). */
  width?: number;
  height?: number;
  rotation?: number;
}
