import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
import CommunityCover from '../../../elements/CommunityCover/CommunityCover';

type AmityCommunityHeaderComponentProps = {
  pageId?: PageID;
  communityId: string;
};

const AmityCommunityHeaderComponent: FC<AmityCommunityHeaderComponentProps> = ({
  pageId = PageID.WildCardPage,
  communityId,
}) => {
  const componentId = ComponentID.community_header;
  const { community } = useCommunity(communityId);

  const { accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  if (!community) return null;

  return (
    <View testID={accessibilityId} accessibilityLabel={accessibilityId}>
      <CommunityCover
        pageId={pageId}
        componentId={componentId}
        community={community}
      />
    </View>
  );
};

export default memo(AmityCommunityHeaderComponent);
