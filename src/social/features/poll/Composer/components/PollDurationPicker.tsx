import { TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useStyles } from '../styles';
import { arrowLeft } from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import dayjs from 'dayjs';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { usePollPostComposerContext } from '../PollPostComposer';

export function AndroidPollDurationPicker() {
  const { styles } = useStyles();
  const {
    duration,
    selectedDate,
    setSelectedTime,
    selectedTime,
    setSelectedDate,
  } = usePollPostComposerContext();
  const endOn = dayjs().add(duration.value, 'day');
  const isCustom = duration.value === 0;

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      mode: 'date',
      value: selectedDate,
      minimumDate: dayjs().toDate(),
      maximumDate: dayjs().add(1, 'month').toDate(),
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          setSelectedDate(date);
        }
      },
    });
  };

  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      mode: 'time',
      value: selectedTime,
      is24Hour: true,
      onChange: (event, time) => {
        if (event.type === 'set' && time) {
          setSelectedTime(time);
        }
      },
    });
  };

  return (
    <View>
      {!isCustom ? (
        <Typography.Caption style={styles.base}>
          Ends on {endOn.format('DD MMM')} at {endOn.format('HH:mm A')}
        </Typography.Caption>
      ) : (
        <View style={styles.androidDateTimeContainer}>
          <Typography.Body style={styles.base}>Ends on</Typography.Body>
          <View style={styles.androidDateTimeContainer}>
            <TouchableOpacity
              style={styles.androidDateTimeButton}
              onPress={openDatePicker}
            >
              <Typography.Body style={styles.base}>
                {dayjs(selectedDate).format('DD MMM YYYY')}
              </Typography.Body>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.androidDateTimeButton}
              onPress={openTimePicker}
            >
              <Typography.Body style={styles.base}>
                {dayjs(selectedTime).format('HH:mm A')}
              </Typography.Body>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export function IOSPollDurationPicker() {
  const { styles, theme } = useStyles();
  const { width } = useWindowDimensions();
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
        style={[styles.iOSDateTimePicker, { width }]}
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
