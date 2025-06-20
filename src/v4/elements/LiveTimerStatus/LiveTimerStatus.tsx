import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum';
import { Typography } from '../../component/Typography/Typography';

type LiveTimerStatusProps = {
  time?: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

function LiveTimerStatus({
  time,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}: LiveTimerStatusProps) {
  const elementId = ElementID.live_timer_status;
  const { themeStyles } = useAmityElement({ pageId, componentId, elementId });
  const styles = useStyles(themeStyles);

  return (
    <View style={styles.container}>
      <Typography.CaptionBold style={styles.label}>
        LIVE{time ? ` ${time}` : ''}
      </Typography.CaptionBold>
    </View>
  );
}

export default LiveTimerStatus;
