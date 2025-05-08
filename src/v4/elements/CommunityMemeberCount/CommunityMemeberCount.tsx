import React, { FC, memo } from 'react';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { formatNumber } from '../../../util/numberUtil';
import { useStyles } from './styles';

type CommunityMemeberCountProps = {
  counts?: number;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityMemeberCount: FC<CommunityMemeberCountProps> = ({
  counts,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_member_count,
  });

  const styles = useStyles(themeStyles);

  const memberCounts = formatNumber(counts);

  if (isExcluded) return null;

  return (
    <Typography.Caption style={styles.memberText} testID={accessibilityId}>
      {memberCounts} member
      {counts > 1 ? 's' : ''}
    </Typography.Caption>
  );
};

export default memo(CommunityMemeberCount);
