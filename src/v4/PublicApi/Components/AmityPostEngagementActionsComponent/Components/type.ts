import { ComponentID, PageID } from '../../../../../social/enums';

export type AmityPostEngagementActionsSubComponentType = {
  community?: Amity.Community;
  postId: string;
  pageId?: PageID;
  componentId?: ComponentID;
};
