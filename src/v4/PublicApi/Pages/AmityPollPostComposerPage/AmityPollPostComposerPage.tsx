import React, { createContext, useContext, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
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
import dayjs from 'dayjs';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import globalFeedSlice from '../../../../redux/slices/globalfeedSlice';
import { useDispatch } from 'react-redux';
import { useToast } from '../../../stores/slices/toast';
import { DAY, MAX_POLL_ANSWER_LENGTH } from '../../../constants';
import { PollHeader } from './PollHeader';
import { PollQuestion } from './PollQuestion';
import { PollOptions } from './PollOptions';
import { PollSelection } from './PollSelection';
import { PollDuration } from './PollDuration';
import { AndroidBottomSheet, IOSBottomSheet } from './PollDurationBottomSheet';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import useMention from '../../../hook/useMention';
import { IMentionPosition } from '../../../../types';

type PollDurationValue = {
  value: number;
  label: string;
};

export const durationOptions: PollDurationValue[] = [
  { value: 1, label: '1 day' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
];

export const androidDurationOptions: PollDurationValue[] = [
  ...durationOptions,
  { value: 0, label: 'Custom end date' },
];

export type PollPostComposerContextType = {
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
  setMentionUsers: React.Dispatch<React.SetStateAction<TSearchItem[]>>;
  mentionPosition: any[];
  setMentionPosition: React.Dispatch<React.SetStateAction<any[]>>;
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

export const usePollPostComposerContext = () => {
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
  const [duration, setDuration] = useState<PollDurationValue>(
    durationOptions[durationOptions.length - 1]
  );
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const [isShowingDatePicker, setIsShowingDatePicker] = useState(false);
  const [isTimePickerShown, setIsTimePickerShown] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().toDate());
  const [selectedTime, setSelectedTime] = useState<Date>(dayjs().toDate());

  const [pollQuestion, setPollQuestion] = useState('');
  const [mentionUsers, setMentionUsers] = useState<TSearchItem[]>([]);
  const [mentionPosition, setMentionPosition] = useState<IMentionPosition[]>(
    []
  );

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
    setPollQuestion,
    pollOptions,
    setPollOptions,
    pollQuestion,
    mentionUsers,
    setMentionUsers,
    mentionPosition,
    setMentionPosition,
    bottomSheetRef,
    selectedTime,
    isShowingDatePicker,
    selectedDate,
  } = usePollPostComposerContext();

  const { targetId, targetType, targetName, community, pop } = route.params;

  const privateCommunityId =
    targetType === 'community' && !community?.isPublic && targetId;

  const { renderInput, renderSuggestions } = useMention({
    value: pollQuestion,
    onChange: setPollQuestion,
    communityId: privateCommunityId,
    setMentionUsers: (user: TSearchItem) => {
      setMentionUsers((prev) => [...prev, user]);
    },
    setMentionPosition: (position: IMentionPosition) => {
      setMentionPosition((prev) => [...prev, position]);
    },
  });

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
        answers: pollOptions.filter((option) => option.data.trim().length > 0),
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
        data: {
          pollId,
          text: replaceTriggerValues(pollQuestion, ({ name }) => `@${name}`),
        },
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
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={true}
        >
          <PollQuestion renderInput={renderInput} />
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
        {renderSuggestions({ type: 'post' })}
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
