import { useAmityElement, useTimeDifference } from '../../hooks';
import React, { ComponentProps } from 'react';
import { ComponentID, ElementID, PageID } from '../../enums';
import { Typography } from '../../../core/components/Typography/Typography';
import { useStyles } from './styles';

type TimestampProps = ComponentProps<typeof Typography> & {
  pageId?: PageID;
  elementId?: ElementID;
  componentId?: ComponentID;
  timestamp: string;
};

function Timestamp({
  pageId = PageID.WildCardPage,
  elementId = ElementID.timestamp,
  componentId = ComponentID.WildCardComponent,
  timestamp,
  ...props
}: TimestampProps) {
  const $timestamp = useTimeDifference(timestamp);
  const { accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <Typography.Caption
      style={[styles.container, props.style]}
      testID={accessibilityId}
      {...props}
    >
      {$timestamp}
    </Typography.Caption>
  );
}

export default Timestamp;
