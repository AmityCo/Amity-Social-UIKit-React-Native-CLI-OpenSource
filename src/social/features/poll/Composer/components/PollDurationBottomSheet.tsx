import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import {
  arrowRight,
  radioChecked,
  radioUnchecked,
} from '../../../../../core/assets/icons';
import { Radio } from '../../../../../core/components/Radio';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { IOSPollDurationPicker } from './PollDurationPicker';
import { useStyles } from '../styles';
import {
  androidDurationOptions,
  durationOptions,
  usePollPostComposerContext,
} from '../PollPostComposer';

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

// Android: Pressable is unreliable inside @devvie/bottom-sheet's PanResponder-
// controlled Animated.View — touches are intercepted before reaching Pressable.
// Use TouchableOpacity rows with explicit radio SVG icons instead.
export function AndroidBottomSheet() {
  const { styles, theme } = useStyles();
  const { bottom } = useSafeAreaInsets();
  const { duration, setDuration, bottomSheetRef } =
    usePollPostComposerContext();

  return (
    <View style={{ paddingBottom: bottom + 8 }}>
      {androidDurationOptions.map((option) => {
        const isSelected =
          duration.value === option.value && duration.label === option.label;
        return (
          <TouchableOpacity
            key={option.label}
            style={styles.androidDurationOption}
            onPress={() => {
              setDuration(option);
              bottomSheetRef.current?.close();
            }}
          >
            <Typography.BodyBold style={styles.base}>
              {option.label}
            </Typography.BodyBold>
            <SvgXml
              width={24}
              height={24}
              xml={isSelected ? radioChecked() : radioUnchecked()}
              color={
                isSelected ? theme.colors.primary : theme.colors.baseShade3
              }
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
