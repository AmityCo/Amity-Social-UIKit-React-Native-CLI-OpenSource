import { ComponentID, PageID } from '../../../../../enums';

export type AmityPostEngagementActionsSubComponentType = {
  community?: Amity.Community;
  postId: string;
  pageId?: PageID;
  componentId?: ComponentID;
};
