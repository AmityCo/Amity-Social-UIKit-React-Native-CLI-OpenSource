import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from '../../Typography/Typography';
import { EVENT_TYPE_LABEL } from '../../constants';

// Web parity: EventTypeBadge — pill with white CaptionBold label on
// transparent black (--asc-color-transparent-black), fixed by design.
const styles = StyleSheet.create({
  badge: {
    borderRadius: 160,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignSelf: 'flex-start',
  },
  label: {
    color: '#FFFFFF',
  },
});

const EventTypeBadge = ({ type }: { type: Amity.EventType }) => {
  return (
    <View style={styles.badge}>
      <Typography.CaptionBold style={styles.label}>
        {EVENT_TYPE_LABEL[type]}
      </Typography.CaptionBold>
    </View>
  );
};

export default memo(EventTypeBadge);
