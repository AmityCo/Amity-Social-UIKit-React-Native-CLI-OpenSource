import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  Switch,
  ScrollView,
  Alert,
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
import { arrowDown, close, plus, trash } from '../../../assets/icons';
import { Typography } from '../../../component/Typography/Typography';
import AmityMentionInput from '../../../component/MentionInput/AmityMentionInput';

const MAX_POLL_QUESTION_LENGTH = 500;
const MAX_POLL_ANSWER_LENGTH = 60;

const AmityPollPostComposerPage = () => {
  const { styles, theme } = useStyles();
  const { apiRegion, client } = useAuth();
  const [loading, setLoading] = useState(false);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'PollPostComposer'>
    >();

  const route = useRoute<RouteProp<RootStackParamList, 'PollPostComposer'>>();

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
  const [timeFrame, _] = useState<{ key: number; label: string }>(null);
  const {
    targetId,
    targetType,
    targetName,
    postSetting,
    needApprovalOnPostCreation,
    isPublic,
  } = route.params;
  const privateCommunityId =
    targetType === 'community' && !isPublic && targetId;
  const MAX_SCHEDULE_DAYS = 30;
  const MILLISECONDS_IN_DAY = 86400000;
  const closedIn = MILLISECONDS_IN_DAY * parseInt(timeFrame?.label, 10) || null;
  const answerType = isMultipleOption ? 'multiple' : 'single';
  const data: { key: number; section?: boolean; label: string }[] = [
    {
      key: 0,
      section: true,
      label: 'Choose time frame',
    },
  ];
  for (let index = 0; index < MAX_SCHEDULE_DAYS; index++) {
    data[index + 1] = { key: index + 1, label: `${index + 1} days` };
  }

  const goBack = () => {
    if (
      pollQuestion.length > 0 ||
      pollOptions.some((option) => option.data?.trim().length > 0)
    ) {
      Alert.alert(
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
    } else {
      navigation.goBack();
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);
    const {
      data: { pollId },
    } = await PollRepository.createPoll({
      question: pollQuestion,
      answerType: answerType,
      answers: pollOptions,
      closedIn: closedIn,
    });
    if (!pollId) return;
    const mentionees: Amity.UserMention[] = [
      {
        type: 'user',
        userIds: mentionUsers.map((user) => user.id),
      },
    ];
    try {
      const response = await PostRepository.createPost({
        dataType: 'poll',
        targetType,
        targetId,
        data: { pollId, text: pollQuestion },
        mentionees,
        metadata: { mentioned: mentionPosition },
      });
      setLoading(false);
      if (targetType !== 'community') return goBack();
      if (
        !response ||
        postSetting !== 'ADMIN_REVIEW_POST_REQUIRED' ||
        !needApprovalOnPostCreation
      )
        return goBack();
      const res = await checkCommunityPermission(
        targetId,
        client as Amity.Client,
        apiRegion
      );
      if (
        res.permissions.length > 0 &&
        res.permissions.includes('Post/ManagePosts')
      )
        return goBack();
      Alert.alert(
        'Post submitted',
        'Your post has been submitted to the pending list. It will be reviewed by community moderator',
        [
          {
            text: 'OK',
            onPress: () => goBack(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      if (error.message.includes(text_contain_blocked_word)) {
        Alert.alert('', text_contain_blocked_word);
      }
    }
  };

  const onPressAddOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions((prev) => [...prev, { data: '', dataType: 'text' }]);
    }
  };

  const onPressRemoveOption = (index: number) => {
    const currentOptions = [...pollOptions].filter((_, i) => i !== index);
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
          <Typography.Body
            style={[styles.cta, isBtnDisable && styles.disabled]}
          >
            Post
          </Typography.Body>
        </TouchableOpacity>
      </View>
      <ScrollView
        scrollEnabled={isScrollEnabled}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.form}
      >
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
        <View style={styles.fieldContainer}>
          <Typography.TitleBold style={styles.base}>
            Options
          </Typography.TitleBold>
          <Typography.Caption style={styles.baseShade1}>
            Poll must contain at least 2 options.
          </Typography.Caption>
          <View style={styles.optionsContainer}>
            {pollOptions.map((pollOption, index) => {
              const onReachMaxChar =
                pollOption.data.length > MAX_POLL_ANSWER_LENGTH;

              return (
                <View>
                  <View style={styles.pollOptionContainer}>
                    <View
                      key={index}
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
                      Poll option cannot exceed {MAX_POLL_ANSWER_LENGTH}{' '}
                      characters.
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
        <View style={styles.divider} />
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
        <View style={styles.divider} />
        <View style={styles.fieldContainer}>
          <Typography.TitleBold style={styles.base}>
            Poll duration
          </Typography.TitleBold>
          <Typography.Caption style={styles.baseShade1}>
            You can always close the poll before the set duration.
          </Typography.Caption>
          <TouchableOpacity style={styles.durationButton}>
            <View style={styles.rowContainer}>
              <Typography.Body style={styles.base}>30 days</Typography.Body>
              <SvgXml
                width="24"
                height="24"
                xml={arrowDown()}
                color={theme.colors.baseShade2}
              />
            </View>
          </TouchableOpacity>
          {/* <ModalSelector
            data={data}
            selectTextStyle={styles.selectedTimeFrame}
            selectedKey={timeFrame?.key || null}
            onModalClose={setTimeFrame}
            initValue="Choose time frame"
            selectStyle={styles.scheduleSelectorSelectStyle}
            optionContainerStyle={styles.scheduleOptionContainer}
            optionTextStyle={styles.scheduleOptionText}
            sectionTextStyle={styles.scheduleTitleStyle}
            sectionStyle={styles.scheduleSectionStyle}
            optionStyle={styles.scheduleOptionStyle}
            initValueTextStyle={styles.scheduleInitValueTextStyle}
            selectedItemTextStyle={styles.scheduleSelectedItemText}
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AmityPollPostComposerPage;
