import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useStyles } from './styles';
import { arrowLeft } from '../../../assets/icons';
import { Typography } from '../../../component/Typography/Typography';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  androidDurationOptions,
  usePollPostComposerContext,
} from './AmityPollPostComposerPage';

export function AndroidPollDurationPicker() {
  const { styles, theme } = useStyles();
  const {
    duration,
    selectedDate,
    setSelectedTime,
    selectedTime,
    setSelectedDate,
    setIsShowingDatePicker,
    setIsTimePickerShown,
    isShowingDatePicker,
    isTimePickerShown,
  } = usePollPostComposerContext();
  const endOn = dayjs().add(duration.value, 'day');

  return (
    <View>
      {duration.label !==
      androidDurationOptions[androidDurationOptions.length - 1].label ? (
        <Typography.Caption style={styles.base}>
          Ends on {endOn.format('DD MMM')} at {endOn.format('HH:mm A')}
        </Typography.Caption>
      ) : (
        <View style={styles.androidDateTimeContainer}>
          <Typography.Body style={styles.base}>Ends on</Typography.Body>
          <View style={styles.androidDateTimeContainer}>
            <TouchableOpacity
              style={styles.androidDateTimeButton}
              onPress={() => setIsShowingDatePicker(true)}
            >
              <Typography.Body style={styles.base}>
                {dayjs(selectedDate).format('DD MMM YYYY')}
              </Typography.Body>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.androidDateTimeButton}
              onPress={() => setIsTimePickerShown(true)}
            >
              <Typography.Body style={styles.base}>
                {dayjs(selectedTime).format('HH:mm A')}
              </Typography.Body>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isShowingDatePicker && (
        <DateTimePicker
          mode="date"
          locale="en_US"
          display="compact"
          value={selectedDate}
          minimumDate={dayjs().toDate()}
          accentColor={theme.colors.primary}
          maximumDate={dayjs().add(1, 'month').toDate()}
          onChange={(event, date) => {
            setIsShowingDatePicker(false);
            if (event.type === 'set') {
              setSelectedDate(date);
            }
          }}
        />
      )}
      {isTimePickerShown && (
        <DateTimePicker
          mode="time"
          display="clock"
          value={selectedTime}
          onChange={(event, time) => {
            setIsTimePickerShown(false);
            if (event.type === 'set') {
              setSelectedTime(time);
            }
          }}
        />
      )}
    </View>
  );
}

export function IOSPollDurationPicker() {
  const { styles, theme } = useStyles();
  const {
    setDuration,
    selectedDate,
    bottomSheetRef,
    setSelectedDate,
    setIsShowingDatePicker,
  } = usePollPostComposerContext();

  return (
    <View>
      <View style={styles.iOSDateTimeHeader}>
        <TouchableOpacity onPress={() => setIsShowingDatePicker(false)}>
          <View>
            <SvgXml
              width="24"
              height="24"
              xml={arrowLeft()}
              color={theme.colors.base}
            />
          </View>
        </TouchableOpacity>
        <Typography.TitleBold style={styles.base}>Ends on</Typography.TitleBold>
        <TouchableOpacity
          disabled={!selectedDate}
          onPress={() => {
            bottomSheetRef.current?.close();
            setDuration({
              value: 0,
              label: `End on ${dayjs(selectedDate).format('DD MMM')} at ${dayjs(
                selectedDate
              ).format('HH:mm A')}`,
            });
          }}
        >
          <Typography.Body
            style={[styles.cta, !selectedDate && styles.disabled]}
          >
            Done
          </Typography.Body>
        </TouchableOpacity>
      </View>
      <DateTimePicker
        locale="en_US"
        mode="datetime"
        display="inline"
        value={selectedDate}
        minimumDate={dayjs().toDate()}
        style={styles.iOSDateTimePicker}
        accentColor={theme.colors.primary}
        maximumDate={dayjs().add(1, 'month').toDate()}
        onChange={(event, date) => {
          if (event.type === 'set') {
            setSelectedDate(date);
          }
        }}
      />
    </View>
  );
}
