import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
import { useStyles } from './styles';
import CommunityCover from '../../../elements/CommunityCover/CommunityCover';
import CommunityPrivateBadge from '../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityName from '../../../elements/CommunityName/CommunityName';
import CommunityVerifyBadge from '../../../elements/CommunityVerifyBadge/CommunityVerifyBadge';
import CommunityCategory from '../../../elements/CommunityCatetory/CommunityCategory';

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

  const styles = useStyles();

  if (!community) return null;

  return (
    <View testID={accessibilityId} accessibilityLabel={accessibilityId}>
      <CommunityCover
        pageId={pageId}
        componentId={componentId}
        community={community}
      />
      <View style={styles.communityNameWrap}>
        {!community.isPublic && (
          <CommunityPrivateBadge pageId={pageId} componentId={componentId} />
        )}
        <CommunityName
          pageId={pageId}
          componentId={componentId}
          communityName={community.displayName}
        />
        {community.isOfficial && (
          <CommunityVerifyBadge pageId={pageId} componentId={componentId} />
        )}
      </View>
      <CommunityCategory
        pageId={pageId}
        componentId={componentId}
        categoryIds={community.categoryIds}
        allVisible={true}
        style={styles.categoryWrap}
      />
    </View>
  );
};

export default memo(AmityCommunityHeaderComponent);
