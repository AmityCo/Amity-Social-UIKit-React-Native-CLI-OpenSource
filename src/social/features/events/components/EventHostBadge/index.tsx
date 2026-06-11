import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { eventHost } from '../../../../../core/assets/icons';
import { Typography } from '../../Typography/Typography';
import { EVENTS_STRINGS } from '../../constants';

// Web parity: EventHostBadge — trophy icon on the host accent colors
// (--asc-color-host-default #4B1BD0 on --asc-color-host-shade1 #EAE2FF).
const HOST_COLOR = '#4B1BD0';
const HOST_BACKGROUND = '#EAE2FF';

const styles = StyleSheet.create({
  badge: {
    padding: 2,
    borderRadius: 160,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: HOST_BACKGROUND,
  },
  badgeWithLabel: {
    gap: 2,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 4,
    paddingRight: 6,
  },
  label: {
    paddingTop: 2,
    color: HOST_COLOR,
  },
});

const EventHostBadge = ({ withLabel = false }: { withLabel?: boolean }) => {
  return (
    <View style={[styles.badge, withLabel && styles.badgeWithLabel]}>
      <SvgXml xml={eventHost()} width={16} height={16} color={HOST_COLOR} />
      {withLabel && (
        <Typography.CaptionSmall style={styles.label}>
          {EVENTS_STRINGS.HOST}
        </Typography.CaptionSmall>
      )}
    </View>
  );
};

export default memo(EventHostBadge);
