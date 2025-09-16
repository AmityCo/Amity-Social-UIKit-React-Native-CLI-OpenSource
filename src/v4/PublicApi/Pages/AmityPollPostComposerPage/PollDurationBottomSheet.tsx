import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import arrowRight from '../../../assets/icons/arrowRight';
import { Radio } from '../../../component/core/Radio';
import { Typography } from '../../../component/Typography/Typography';
import { IOSPollDurationPicker } from './PollDurationPicker';
import { useStyles } from './styles';
import {
  androidDurationOptions,
  durationOptions,
  usePollPostComposerContext,
} from './AmityPollPostComposerPage';

export function IOSBottomSheet() {
  const { styles, theme } = useStyles();
  const {
    duration,
    setDuration,
    bottomSheetRef,
    isShowingDatePicker,
    setIsShowingDatePicker,
  } = usePollPostComposerContext();

  return (
    <View>
      {isShowingDatePicker ? (
        <IOSPollDurationPicker />
      ) : (
        <View>
          <Radio.Group
            value={duration.value}
            onChange={(value) => {
              setDuration(
                durationOptions.find((option) => option.value === value)
              );
              bottomSheetRef.current?.close();
            }}
          >
            {durationOptions.map((option) => (
              <Radio.Option
                value={option.value}
                accessibilityLabel={option.label}
              >
                <Radio.Label>
                  <Typography.BodyBold style={styles.base}>
                    {option.label}
                  </Typography.BodyBold>
                </Radio.Label>
                <Radio.Icon />
              </Radio.Option>
            ))}
          </Radio.Group>
          <TouchableOpacity
            style={styles.pickDateTimeButton}
            onPress={() => setIsShowingDatePicker(true)}
          >
            <Typography.BodyBold style={styles.base}>
              Pick date and time
            </Typography.BodyBold>
            <SvgXml
              width="24"
              height="24"
              xml={arrowRight()}
              color={theme.colors.base}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function AndroidBottomSheet() {
  const { styles } = useStyles();
  const { duration, setDuration, bottomSheetRef } =
    usePollPostComposerContext();

  return (
    <Radio.Group
      value={duration.value}
      onChange={(value) => {
        setDuration(
          androidDurationOptions.find((option) => option.value === value)
        );
        bottomSheetRef.current?.close();
      }}
    >
      {androidDurationOptions.map((option) => (
        <Radio.Option value={option.value} accessibilityLabel={option.label}>
          <Radio.Label>
            <Typography.BodyBold style={styles.base}>
              {option.label}
            </Typography.BodyBold>
          </Radio.Label>
          <Radio.Icon />
        </Radio.Option>
      ))}
    </Radio.Group>
  );
}
