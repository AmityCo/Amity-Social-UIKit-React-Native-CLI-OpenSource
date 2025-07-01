import dayjs from 'dayjs';
import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import arrowDown from '../../../assets/icons/arrowDown';
import { Typography } from '../../../component/Typography/Typography';
import { usePollPostComposerContext } from './AmityPollPostComposerPage';
import { useStyles } from './styles';
import { AndroidPollDurationPicker } from './PollDurationPicker';

export function PollDuration() {
  const { styles, theme } = useStyles();
  const { duration, bottomSheetRef } = usePollPostComposerContext();

  return (
    <View style={styles.fieldContainer}>
      <Typography.TitleBold style={styles.base}>
        Poll duration
      </Typography.TitleBold>
      <Typography.Caption style={styles.baseShade1}>
        You can always close the poll before the set duration.
      </Typography.Caption>
      <View>
        <TouchableOpacity
          style={styles.durationButton}
          onPress={() => bottomSheetRef.current?.open()}
        >
          <View style={styles.rowContainer}>
            <Typography.Body style={styles.base}>
              {duration.label}
            </Typography.Body>
            <SvgXml
              width="24"
              height="24"
              xml={arrowDown()}
              color={theme.colors.baseShade2}
            />
          </View>
        </TouchableOpacity>
        {Platform.OS === 'ios' && duration.value > 0 && (
          <Typography.Caption style={styles.base}>
            Ends on {dayjs().add(duration.value, 'day').format('DD MMM')} at{' '}
            {dayjs().add(duration.value, 'day').format('HH:mm A')}
          </Typography.Caption>
        )}
        {Platform.OS === 'android' && <AndroidPollDurationPicker />}
      </View>
    </View>
  );
}
