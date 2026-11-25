import { FC, memo } from 'react';
import { AmityPostContentComponentStyleEnum } from '../../../../enums/AmityPostContentComponentStyle';
import { AmityPostEngagementActionsSubComponent } from './Components';
import { PostTargetType } from '../../../../../core/enums';
import { ComponentID, PageID } from '../../../../enums';
import { useCommunity } from '../../../../hooks';

type AmityPostEngagementActionsComponentType = {
  AmityPostContentComponentStyle?: AmityPostContentComponentStyleEnum;
  targetId: string;
  targetType: PostTargetType;
  postId: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const AmityPostEngagementActionsComponent: FC<
  AmityPostEngagementActionsComponentType
> = ({
  AmityPostContentComponentStyle = AmityPostContentComponentStyleEnum.detail,
  targetId,
  targetType,
  postId,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  // Closed when the card unmounts; the subscription here used to be dropped,
  // leaving the post's community watched for the rest of the session.
  const { community: communityData } = useCommunity(
    targetType === 'community' ? targetId : undefined
  );

  if (
    AmityPostContentComponentStyle === AmityPostContentComponentStyleEnum.feed
  )
    return (
      <AmityPostEngagementActionsSubComponent.FeedStyle
        community={communityData}
        pageId={pageId}
        componentId={componentId}
        postId={postId}
      />
    );
  if (
    AmityPostContentComponentStyle === AmityPostContentComponentStyleEnum.detail
  )
    return (
      <AmityPostEngagementActionsSubComponent.DetailStyle
        community={communityData}
        postId={postId}
        pageId={pageId}
        componentId={componentId}
      />
    );
  return null;
};

export default memo(AmityPostEngagementActionsComponent);
