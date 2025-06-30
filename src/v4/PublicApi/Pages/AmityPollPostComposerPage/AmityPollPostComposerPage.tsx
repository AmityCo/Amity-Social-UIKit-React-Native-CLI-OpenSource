import React, { createContext, useContext, useRef, useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useStyles } from './styles';
import { PollRepository, PostRepository } from '@amityco/ts-sdk-react-native';
import { checkCommunityPermission } from '../../../../providers/Social/communities-sdk';
import useAuth from '../../../../hooks/useAuth';
import { TSearchItem } from '../../../../hooks/useSearch';
import { text_contain_blocked_word } from '../../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  close,
  plus,
  trash,
} from '../../../assets/icons';
import { Typography } from '../../../component/Typography/Typography';
import AmityMentionInput from '../../../component/MentionInput/AmityMentionInput';
import { Radio } from '../../../component/Radio';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import globalFeedSlice from '../../../../redux/slices/globalfeedSlice';
import { useDispatch } from 'react-redux';
import { useToast } from '../../../stores/slices/toast';
import {
  DAY,
  MAX_POLL_ANSWER_LENGTH,
  MAX_POLL_QUESTION_LENGTH,
} from '../../../constants';

type PollDurationValue = {
  value: number;
  label: string;
};

const durationOptions: PollDurationValue[] = [
  { value: 1, label: '1 day' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
];

const androidDurationOptions: PollDurationValue[] = [
  ...durationOptions,
  { value: 0, label: 'Custom end date' },
];

type PollPostComposerContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isMultipleOption: boolean;
  setIsMultipleOption: (value: boolean) => void;
  pollOptions: Pick<Amity.PollAnswer, 'data' | 'dataType'>[];
  setPollOptions: React.Dispatch<
    React.SetStateAction<Pick<Amity.PollAnswer, 'data' | 'dataType'>[]>
  >;
  pollQuestion: string;
  setPollQuestion: (question: string) => void;
  mentionUsers: TSearchItem[];
  setMentionUsers: (users: TSearchItem[]) => void;
  mentionPosition: any[];
  setMentionPosition: (position: any[]) => void;
  isScrollEnabled: boolean;
  setIsScrollEnabled: (isEnabled: boolean) => void;
  duration: PollDurationValue;
  setDuration: (duration: PollDurationValue) => void;
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
  isShowingDatePicker?: boolean;
  setIsShowingDatePicker?: (isShowing: boolean) => void;
  isTimePickerShown?: boolean;
  setIsTimePickerShown?: (isShown: boolean) => void;
  selectedDate?: Date;
  setSelectedDate?: (date: Date) => void;
  selectedTime?: Date;
  setSelectedTime?: (time: Date) => void;
};

const PollPostComposerContext =
  createContext<PollPostComposerContextType | null>(null);

const usePollPostComposerContext = () => {
  const context = useContext(PollPostComposerContext);
  return context;
};

const AmityPollPostComposerPage = () => {
  const [loading, setLoading] = useState(false);
  const [isMultipleOption, setIsMultipleOption] = useState(false);
  const [pollOptions, setPollOptions] = useState<
    Pick<Amity.PollAnswer, 'data' | 'dataType'>[]
  >([
    { data: '', dataType: 'text' },
    { data: '', dataType: 'text' },
  ]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [mentionUsers, setMentionUsers] = useState<TSearchItem[]>([]);
  const [mentionPosition, setMentionPosition] = useState([]);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [duration, setDuration] = useState<PollDurationValue>(
    durationOptions[durationOptions.length - 1]
  );
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const [isShowingDatePicker, setIsShowingDatePicker] = useState(false);
  const [isTimePickerShown, setIsTimePickerShown] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().toDate());
  const [selectedTime, setSelectedTime] = useState<Date>(dayjs().toDate());

  return (
    <PollPostComposerContext.Provider
      value={{
        loading,
        setLoading,
        isMultipleOption,
        setIsMultipleOption,
        pollOptions,
        setPollOptions,
        pollQuestion,
        setPollQuestion,
        mentionUsers,
        setMentionUsers,
        mentionPosition,
        setMentionPosition,
        isScrollEnabled,
        setIsScrollEnabled,
        duration,
        setDuration,
        bottomSheetRef,
        isShowingDatePicker,
        setIsShowingDatePicker,
        isTimePickerShown,
        setIsTimePickerShown,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
      }}
    >
      <PollPostComposer />
    </PollPostComposerContext.Provider>
  );
};

export default AmityPollPostComposerPage;

const PollPostComposer = () => {
  const dispatch = useDispatch();
  const { styles } = useStyles();
  const { apiRegion, client } = useAuth();
  const { addPostToGlobalFeed } = globalFeedSlice.actions;
  const { showToast, hideToast } = useToast();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PollPostComposer'>
    >();

  const route = useRoute<RouteProp<RootStackParamList, 'PollPostComposer'>>();
  const {
    loading,
    setLoading,
    duration,
    isMultipleOption,
    isScrollEnabled,
    pollOptions,
    setPollOptions,
    pollQuestion,
    mentionUsers,
    setMentionUsers,
    mentionPosition,
    setMentionPosition,
    setIsScrollEnabled,
    bottomSheetRef,
    selectedTime,
    isShowingDatePicker,
    selectedDate,
  } = usePollPostComposerContext();

  const { targetId, targetType, targetName, community, pop } = route.params;

  const privateCommunityId =
    targetType === 'community' && !community?.isPublic && targetId;

  const goBack = () => {
    const unsavedChanges =
      pollQuestion.length > 0 ||
      pollOptions.some((option) => option.data?.trim().length > 0);

    !unsavedChanges
      ? navigation.goBack()
      : Alert.alert(
          'Discard this post?',
          'The post will be permanently deleted. It cannot be undone.',
          [
            {
              text: 'Keep editing',
              style: 'default',
            },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: navigation.goBack,
            },
          ]
        );
  };

  const onSuccess = () => {
    pop ? navigation.pop(pop) : navigation.goBack();
  };

  const handleCreatePost = async () => {
    try {
      setLoading(true);
      showToast({ message: 'Creating poll...', type: 'loading' });
      const closedIn =
        duration.value === 0
          ? Platform.OS === 'android'
            ? dayjs(selectedDate)
                .hour(dayjs(selectedTime).hour())
                .minute(dayjs(selectedTime).minute())
                .second(dayjs(selectedTime).second())
                .millisecond(0)
                .diff(dayjs(), 'milliseconds')
            : dayjs(selectedDate).diff(dayjs(), 'milliseconds')
          : duration.value * DAY;

      const answerType = isMultipleOption ? 'multiple' : 'single';

      const {
        data: { pollId },
      } = await PollRepository.createPoll({
        question: pollQuestion,
        answerType: answerType,
        answers: pollOptions,
        closedIn,
      });

      const mentionees: Amity.UserMention[] = [
        {
          type: 'user',
          userIds: mentionUsers.map((user) => user.id),
        },
      ];

      const response = await PostRepository.createPost({
        dataType: 'poll',
        targetType,
        targetId,
        data: { pollId, text: pollQuestion },
        mentionees,
        metadata: { mentioned: mentionPosition },
      });

      dispatch(addPostToGlobalFeed(response.data));
      hideToast();

      if (community?.postSetting !== 'ADMIN_REVIEW_POST_REQUIRED') {
        return onSuccess();
      }

      const res = await checkCommunityPermission(
        targetId,
        client as Amity.Client,
        apiRegion
      );

      if (
        res.permissions.length > 0 &&
        res.permissions.includes('Post/ManagePosts')
      ) {
        return onSuccess();
      }

      onSuccess();
      Alert.alert(
        'Posts sent for review',
        'Your post has been submitted to the pending list. It will be published once approved by the community moderator.',
        [
          {
            text: 'OK',
          },
        ]
      );
    } catch (error) {
      if (error.message.includes(text_contain_blocked_word)) {
        return Alert.alert('', text_contain_blocked_word);
      }
      showToast({
        type: 'failed',
        message: 'Failed to create poll. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onPressAddOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions((prev) => [...prev, { data: '', dataType: 'text' }]);
    }
  };

  const onPressRemoveOption = (index: number) => {
    const currentOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(currentOptions);
  };

  const onChangeOptionText = (text: string, index: number) => {
    setPollOptions((prev) => {
      return prev.map((item, i) => {
        if (i === index) return { data: text, dataType: 'text' };
        return item;
      });
    });
  };

  const isBtnDisable =
    loading ||
    pollQuestion.length === 0 ||
    pollOptions.length < 2 ||
    pollOptions.filter((option) => option.data.trim().length > 0).length < 2 ||
    pollOptions.some((option) => option.data.length > MAX_POLL_ANSWER_LENGTH);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PollHeader
        goBack={goBack}
        targetName={targetName}
        isBtnDisable={isBtnDisable}
        handleCreatePost={handleCreatePost}
      />
      <KeyboardAvoidingView style={styles.fillSpace}>
        <ScrollView
          scrollEnabled={isScrollEnabled}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={true}
        >
          <PollQuestion
            privateCommunityId={privateCommunityId}
            mentionUsers={mentionUsers}
            setMentionUsers={setMentionUsers}
            mentionPosition={mentionPosition}
            setMentionPosition={setMentionPosition}
            setIsScrollEnabled={setIsScrollEnabled}
          />
          <PollOptions
            onPressAddOption={onPressAddOption}
            onChangeOptionText={onChangeOptionText}
            onPressRemoveOption={onPressRemoveOption}
          />
          <View style={styles.divider} />
          <PollSelection />
          <View style={styles.divider} />
          <PollDuration />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomSheet
        ref={bottomSheetRef}
        style={styles.bottomSheet}
        height={(Platform.OS === 'ios' && isShowingDatePicker && 600) || 400}
      >
        {Platform.OS === 'android' && <AndroidBottomSheet />}
        {Platform.OS === 'ios' && <IOSBottomSheet />}
      </BottomSheet>
    </SafeAreaView>
  );
};

type PollHeaderProps = {
  goBack: () => void;
  targetName: string;
  isBtnDisable: boolean;
  handleCreatePost: () => void;
};

function PollHeader({
  goBack,
  targetName,
  isBtnDisable,
  handleCreatePost,
}: PollHeaderProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack}>
        <SvgXml
          width="24"
          height="24"
          xml={close()}
          color={theme.colors.base}
        />
      </TouchableOpacity>
      <View style={styles.title}>
        <Typography.TitleBold style={styles.base}>
          {targetName}
        </Typography.TitleBold>
      </View>
      <TouchableOpacity disabled={isBtnDisable} onPress={handleCreatePost}>
        <Typography.Body style={[styles.cta, isBtnDisable && styles.disabled]}>
          Post
        </Typography.Body>
      </TouchableOpacity>
    </View>
  );
}

type PollQuestionProps = Pick<
  PollPostComposerContextType,
  | 'mentionUsers'
  | 'setMentionUsers'
  | 'mentionPosition'
  | 'setMentionPosition'
  | 'setIsScrollEnabled'
> & {
  privateCommunityId?: string;
};

function PollQuestion({
  privateCommunityId,
  mentionUsers,
  setMentionUsers,
  mentionPosition,
  setMentionPosition,
  setIsScrollEnabled,
}: PollQuestionProps) {
  const { styles, theme } = useStyles();
  const { pollQuestion, setPollQuestion } = usePollPostComposerContext();
  return (
    <View style={styles.fieldContainer}>
      <View
        style={[
          styles.inputContainer,
          pollQuestion.length > MAX_POLL_QUESTION_LENGTH &&
            styles.inputContainerError,
        ]}
      >
        <View style={styles.rowContainer}>
          <Typography.TitleBold style={styles.base}>
            Poll question
          </Typography.TitleBold>
          <Typography.Caption style={styles.baseShade1}>
            {pollQuestion.length}/{MAX_POLL_QUESTION_LENGTH}
          </Typography.Caption>
        </View>
        <AmityMentionInput
          multiline
          privateCommunityId={privateCommunityId}
          isBottomMentionSuggestionsRender={true}
          onFocus={() => setIsScrollEnabled(false)}
          onBlur={() => setIsScrollEnabled(true)}
          placeholder="What's your poll question?"
          placeholderTextColor={theme.colors.baseShade3}
          setInputMessage={setPollQuestion}
          mentionUsers={mentionUsers}
          setMentionUsers={setMentionUsers}
          mentionsPosition={mentionPosition}
          setMentionsPosition={setMentionPosition}
        />
      </View>
      {pollQuestion.length > MAX_POLL_QUESTION_LENGTH && (
        <Typography.Caption style={styles.errorText}>
          Poll question cannot exceed {MAX_POLL_QUESTION_LENGTH} characters.
        </Typography.Caption>
      )}
    </View>
  );
}

type PollOptionsProps = {
  onPressAddOption: () => void;
  onPressRemoveOption: (index: number) => void;
  onChangeOptionText: (text: string, index: number) => void;
};

function PollOptions({
  onPressAddOption,
  onPressRemoveOption,
  onChangeOptionText,
}: PollOptionsProps) {
  const { styles, theme } = useStyles();
  const { pollOptions } = usePollPostComposerContext();

  return (
    <View style={styles.fieldContainer}>
      <Typography.TitleBold style={styles.base}>Options</Typography.TitleBold>
      <Typography.Caption style={styles.baseShade1}>
        Poll must contain at least 2 options.
      </Typography.Caption>
      <View style={styles.optionsContainer}>
        {pollOptions.map((pollOption, index) => {
          const onReachMaxChar =
            pollOption.data.length > MAX_POLL_ANSWER_LENGTH;

          return (
            <View key={`Option ${index + 1}`}>
              <View style={styles.pollOptionContainer}>
                <View
                  style={[
                    styles.pollOptionInputContainer,
                    onReachMaxChar && styles.pollOptionInputContainerError,
                  ]}
                >
                  <TextInput
                    multiline
                    style={styles.pollOptionInput}
                    value={pollOptions[index].data}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={theme.colors.baseShade3}
                    onChangeText={(text) => onChangeOptionText(text, index)}
                  />
                </View>
                <View>
                  <SvgXml
                    width="20"
                    height="20"
                    xml={trash()}
                    color={theme.colors.base}
                    onPress={() => onPressRemoveOption(index)}
                  />
                </View>
              </View>
              {onReachMaxChar && (
                <Typography.Caption style={styles.errorText}>
                  Poll option cannot exceed {MAX_POLL_ANSWER_LENGTH} characters.
                </Typography.Caption>
              )}
            </View>
          );
        })}
        {pollOptions.length < 10 && (
          <TouchableOpacity
            style={styles.addOptionBtn}
            onPress={onPressAddOption}
          >
            <SvgXml xml={plus(theme.colors.base)} width="20" height="20" />
            <Typography.BodyBold style={styles.addOptionText}>
              Add option
            </Typography.BodyBold>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function PollSelection() {
  const { styles, theme } = useStyles();
  const { isMultipleOption, setIsMultipleOption } =
    usePollPostComposerContext();

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.rowContainer}>
        <View style={styles.fillSpace}>
          <Typography.TitleBold style={styles.base}>
            Multiple selection
          </Typography.TitleBold>
          <Typography.Caption style={styles.baseShade1}>
            Let participants vote more than one option.
          </Typography.Caption>
        </View>
        <Switch
          ios_backgroundColor={theme.colors.baseShade3}
          thumbColor={theme.colors.background}
          trackColor={{
            false: theme.colors.baseShade3,
            true: theme.colors.primary,
          }}
          value={isMultipleOption}
          onValueChange={setIsMultipleOption}
        />
      </View>
    </View>
  );
}

function PollDuration() {
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

function AndroidBottomSheet() {
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

function AndroidPollDurationPicker() {
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

function IOSBottomSheet() {
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

function IOSPollDurationPicker() {
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
