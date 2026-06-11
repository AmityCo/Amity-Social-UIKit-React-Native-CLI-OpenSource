import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { SvgXml } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AmityEventOriginType,
  AmityEventType,
  EventRepository,
  FileRepository,
} from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import { camera as cameraIcon, eventClose } from '../../../../core/assets/icons';
import { Typography } from '../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS, EVENT_TYPE_LABEL } from '../constants';
import { checkIsWithinMinutes } from '../utils';
import useImagePicker from '../../../../core/hooks/useImagePicker';
import { useUpload } from '../../../../core/hooks/useUpload';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';
import { useToast } from '../../../../core/stores/slices/toastSlice';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

// Web parity: EventSetup Platform options
enum EventPlatform {
  Livestream = 'livestream',
  External = 'external',
}

// Web parity: ERROR_CODE (src/v4/social/constants/errorResponse.ts)
const ERROR_CODE = {
  BLOCKED_WORD: '400308',
  BLOCKED_URL: '400309',
};

type DateTimeFieldProps = {
  label: string;
  value: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
};

const DateTimeField = ({
  label,
  value,
  minimumDate,
  onChange,
}: DateTimeFieldProps) => {
  const { styles } = useStyles();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.rowBetween}>
        <Typography.Body style={styles.rowLabel}>{label}</Typography.Body>
        <DateTimePicker
          mode="datetime"
          value={value}
          minimumDate={minimumDate}
          onChange={(_, date) => date && onChange(date)}
        />
      </View>
    );
  }

  return (
    <View style={styles.rowBetween}>
      <Typography.Body style={styles.rowLabel}>{label}</Typography.Body>
      <View style={styles.dateTimeButtons}>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Typography.Body style={styles.dateTimeButtonText}>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography.Body>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Typography.Body style={styles.dateTimeButtonText}>
            {dayjs(value).format('HH:mm')}
          </Typography.Body>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={value}
          minimumDate={minimumDate}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) onChange(date);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={value}
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (date) onChange(date);
          }}
        />
      )}
    </View>
  );
};

type RadioOptionProps = {
  label: string;
  description?: string;
  isActive: boolean;
  onPress: () => void;
};

const RadioOption = ({
  label,
  description,
  isActive,
  onPress,
}: RadioOptionProps) => {
  const { styles } = useStyles();
  return (
    <TouchableOpacity style={styles.radioRow} onPress={onPress}>
      <View style={styles.radioTextContainer}>
        <Typography.BodyBold style={styles.radioLabel}>
          {label}
        </Typography.BodyBold>
        {!!description && (
          <Typography.Caption style={styles.radioDescription}>
            {description}
          </Typography.Caption>
        )}
      </View>
      <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
        {isActive && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Web parity: EventSetup — create/edit event form with cover image, name,
 * details, date & time, and location (virtual livestream / external link, or
 * in-person address) with the same validation and toasts. Structural
 * deviations from Web (documented in the PR): the location editor is inline
 * rather than a separate form sheet, and the timezone is fixed to the
 * device's timezone (Web offers a tzdb picker).
 */
const AmityEventSetupPage = () => {
  const pageId = PageID.event_setup_page;
  const { isExcluded, accessibilityId } = useAmityPage({ pageId });
  const { styles, theme } = useStyles();
  const { showToast, hideToast } = useToast();
  const { AmityEventSetupPageBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventSetup'>>();
  const params = route.params;

  const isCreateEvent = params.mode === 'create';
  const editingEvent = params.mode === 'edit' ? params.event : undefined;
  const targetName = isCreateEvent
    ? params.targetName
    : editingEvent?.targetCommunity?.displayName;
  const targetId = isCreateEvent ? params.targetId : editingEvent?.originId;

  const defaultStartOn = useMemo(() => {
    const tomorrow = dayjs().add(1, 'day').hour(9).minute(0).second(0);
    return tomorrow.toDate();
  }, []);

  const [title, setTitle] = useState(editingEvent?.title ?? '');
  const [description, setDescription] = useState(
    editingEvent?.description ?? ''
  );
  const [startOn, setStartOn] = useState<Date>(
    editingEvent ? new Date(editingEvent.startTime) : defaultStartOn
  );
  const [endOn, setEndOn] = useState<Date>(
    editingEvent
      ? new Date(editingEvent.endTime)
      : dayjs(defaultStartOn).add(1, 'hour').toDate()
  );
  const [type, setType] = useState<Amity.EventType>(
    editingEvent?.type ?? AmityEventType.Virtual
  );
  const [platform, setPlatform] = useState<string>(
    editingEvent
      ? editingEvent.type === AmityEventType.Virtual && editingEvent.externalUrl
        ? EventPlatform.External
        : EventPlatform.Livestream
      : ''
  );
  const [externalUrl, setExternalUrl] = useState(
    editingEvent?.type === AmityEventType.Virtual
      ? editingEvent?.externalUrl ?? ''
      : ''
  );
  const [location, setLocation] = useState(
    editingEvent?.type === AmityEventType.InPerson
      ? editingEvent?.location ?? ''
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { imageUri, openImageGallery } = useImagePicker({
    mediaType: 'photo',
  });
  const { uploadImage, isImageUploading } = useUpload();
  const [uploadedImage, setUploadedImage] = useState<
    Amity.File<'image'> | undefined
  >(undefined);

  useEffect(() => {
    if (!imageUri) return;
    let isMounted = true;
    uploadImage({ file: imageUri }).then((response) => {
      if (isMounted && response?.data?.[0]) {
        setUploadedImage(response.data[0] as Amity.File<'image'>);
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  const existingCoverUrl = editingEvent?.coverImage?.fileUrl
    ? FileRepository.fileUrlWithSize(editingEvent.coverImage.fileUrl, 'medium')
    : undefined;
  const coverPreviewUri = imageUri ?? existingCoverUrl;

  const initialValues = useMemo(
    () =>
      JSON.stringify({
        title: editingEvent?.title ?? '',
        description: editingEvent?.description ?? '',
        startOn: (editingEvent
          ? new Date(editingEvent.startTime)
          : defaultStartOn
        ).toISOString(),
        endOn: (editingEvent
          ? new Date(editingEvent.endTime)
          : dayjs(defaultStartOn).add(1, 'hour').toDate()
        ).toISOString(),
        type: editingEvent?.type ?? AmityEventType.Virtual,
        platform: editingEvent
          ? editingEvent.type === AmityEventType.Virtual &&
            editingEvent.externalUrl
            ? EventPlatform.External
            : EventPlatform.Livestream
          : '',
        externalUrl:
          editingEvent?.type === AmityEventType.Virtual
            ? editingEvent?.externalUrl ?? ''
            : '',
        location:
          editingEvent?.type === AmityEventType.InPerson
            ? editingEvent?.location ?? ''
            : '',
        coverImageFileId: editingEvent?.coverImageFileId ?? undefined,
      }),
    [editingEvent, defaultStartOn]
  );

  const currentValues = JSON.stringify({
    title,
    description,
    startOn: startOn.toISOString(),
    endOn: endOn.toISOString(),
    type,
    platform,
    externalUrl,
    location,
    coverImageFileId:
      uploadedImage?.fileId ?? editingEvent?.coverImageFileId ?? undefined,
  });

  const isDirty = currentValues !== initialValues;

  // Web parity: EventSetup zod schema
  const isValid =
    title.trim().length > 0 &&
    title.trim().length <= 60 &&
    description.trim().length > 0 &&
    description.trim().length <= 1000 &&
    (type === AmityEventType.Virtual
      ? platform.trim().length > 0 &&
        (platform !== EventPlatform.External || externalUrl.trim().length > 0)
      : location.trim().length > 0);

  const onChangeStartOn = useCallback(
    (date: Date) => {
      setStartOn(date);
      if (date > endOn) {
        setEndOn(dayjs(date).add(1, 'hour').toDate());
      }
    },
    [endOn]
  );

  const onPressBack = useCallback(() => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      EVENTS_STRINGS.LEAVE_WITHOUT_FINISHING,
      isCreateEvent
        ? EVENTS_STRINGS.PROGRESS_NOT_SAVED
        : EVENTS_STRINGS.UNSAVED_CHANGES,
      [
        { text: EVENTS_STRINGS.CANCEL, style: 'cancel' },
        {
          text: EVENTS_STRINGS.LEAVE,
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }, [isDirty, isCreateEvent, navigation]);

  const preparePayload = useCallback(() => {
    const timezone =
      Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone ?? 'UTC';
    return {
      title: title.trim(),
      description: description.trim(),
      type,
      coverImageFileId:
        uploadedImage?.fileId ?? editingEvent?.coverImageFileId ?? undefined,
      startTime: startOn.toISOString(),
      endTime: endOn.toISOString(),
      externalUrl:
        type === AmityEventType.Virtual && platform === EventPlatform.External
          ? externalUrl.trim()
          : '',
      location: type === AmityEventType.InPerson ? location.trim() : '',
      metadata: { timezone },
    };
  }, [
    title,
    description,
    type,
    uploadedImage,
    editingEvent,
    startOn,
    endOn,
    platform,
    externalUrl,
    location,
  ]);

  const onSubmit = useCallback(async () => {
    if (checkIsWithinMinutes(startOn.toISOString())) {
      showToast({
        message: isCreateEvent
          ? EVENTS_STRINGS.CREATE_START_TIME_TOO_SOON
          : EVENTS_STRINGS.UPDATE_START_TIME_TOO_SOON,
        type: 'informative',
      });
      return;
    }
    setIsSubmitting(true);
    showToast({
      message: isCreateEvent ? EVENTS_STRINGS.CREATING : EVENTS_STRINGS.SAVING,
      type: 'loading',
    });
    try {
      if (isCreateEvent) {
        const { data } = await EventRepository.createEvent({
          ...preparePayload(),
          originId: targetId,
          originType: AmityEventOriginType.Community,
        });
        hideToast();
        showToast({ message: EVENTS_STRINGS.EVENT_CREATED, type: 'success' });
        if (AmityEventSetupPageBehaviour?.goToEventDetailPage) {
          AmityEventSetupPageBehaviour.goToEventDetailPage({
            eventId: data.eventId,
          });
          return;
        }
        // Pop the target-selection + setup screens, then open the new event
        navigation.dispatch(StackActions.pop(2));
        navigation.navigate('EventDetail', { eventId: data.eventId });
      } else {
        await EventRepository.updateEvent(
          editingEvent!.eventId,
          preparePayload()
        );
        hideToast();
        showToast({ message: EVENTS_STRINGS.EVENT_UPDATED, type: 'success' });
        navigation.goBack();
      }
    } catch (error) {
      hideToast();
      const message = error instanceof Error ? error.message : '';
      if (message.includes(ERROR_CODE.BLOCKED_WORD)) {
        showToast({
          message: isCreateEvent
            ? EVENTS_STRINGS.CREATE_BLOCKED_WORD
            : EVENTS_STRINGS.UPDATE_BLOCKED_WORD,
          type: 'informative',
        });
      } else if (message.includes(ERROR_CODE.BLOCKED_URL)) {
        showToast({
          message: isCreateEvent
            ? EVENTS_STRINGS.CREATE_BLOCKED_URL
            : EVENTS_STRINGS.UPDATE_BLOCKED_URL,
          type: 'informative',
        });
      } else {
        showToast({
          message: isCreateEvent
            ? EVENTS_STRINGS.CREATE_EVENT_FAILED
            : EVENTS_STRINGS.UPDATE_EVENT_FAILED,
          type: 'informative',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    startOn,
    isCreateEvent,
    showToast,
    hideToast,
    preparePayload,
    targetId,
    editingEvent,
    AmityEventSetupPageBehaviour,
    navigation,
  ]);

  if (isExcluded) return null;

  const canSubmit = isDirty && isValid && !isSubmitting && !isImageUploading;

  return (
    <SafeAreaView
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onPressBack}>
          <SvgXml
            xml={eventClose()}
            width={24}
            height={24}
            color={theme.colors.base}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Typography.TitleBold style={styles.headerTitle}>
            {isCreateEvent
              ? EVENTS_STRINGS.CREATE_EVENT
              : EVENTS_STRINGS.EDIT_EVENT}
          </Typography.TitleBold>
          {isCreateEvent && !!targetName && (
            <Typography.Caption style={styles.headerSubtitle}>
              {targetName}
            </Typography.Caption>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <TouchableOpacity
            style={styles.coverImageContainer}
            onPress={() => openImageGallery()}
          >
            {coverPreviewUri && (
              <Image
                source={{ uri: coverPreviewUri }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.coverImageOverlay}>
              <SvgXml
                xml={cameraIcon()}
                width={20}
                height={20}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Typography.TitleBold style={styles.label}>
                {EVENTS_STRINGS.EVENT_NAME}
              </Typography.TitleBold>
              <Typography.Caption style={styles.counter}>
                {`${title.length}/60`}
              </Typography.Caption>
            </View>
            <TextInput
              value={title}
              maxLength={60}
              style={styles.input}
              onChangeText={setTitle}
              placeholder={EVENTS_STRINGS.NAME_YOUR_EVENT}
              placeholderTextColor={theme.colors.baseShade3}
            />
          </View>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Typography.TitleBold style={styles.label}>
                {EVENTS_STRINGS.EVENT_DETAILS}
              </Typography.TitleBold>
              <Typography.Caption style={styles.counter}>
                {`${description.length}/1000`}
              </Typography.Caption>
            </View>
            <TextInput
              multiline
              value={description}
              maxLength={1000}
              style={[styles.input, styles.multilineInput]}
              onChangeText={setDescription}
              placeholder={EVENTS_STRINGS.EVENT_DETAILS_PLACEHOLDER}
              placeholderTextColor={theme.colors.baseShade3}
            />
          </View>
          <View style={styles.field}>
            <Typography.TitleBold style={styles.label}>
              {EVENTS_STRINGS.DATE_AND_TIME}
            </Typography.TitleBold>
            <DateTimeField
              label={EVENTS_STRINGS.STARTS_ON}
              value={startOn}
              minimumDate={new Date()}
              onChange={onChangeStartOn}
            />
            <DateTimeField
              label={EVENTS_STRINGS.ENDS_ON}
              value={endOn}
              minimumDate={startOn}
              onChange={setEndOn}
            />
          </View>
          <View style={styles.field}>
            <Typography.TitleBold style={styles.label}>
              {EVENTS_STRINGS.EVENT_LOCATION}
            </Typography.TitleBold>
            <Typography.Caption style={styles.hint}>
              {EVENTS_STRINGS.SELECT_LOCATION}
            </Typography.Caption>
            <RadioOption
              label={EVENT_TYPE_LABEL[AmityEventType.Virtual]}
              isActive={type === AmityEventType.Virtual}
              onPress={() => setType(AmityEventType.Virtual)}
            />
            {type === AmityEventType.Virtual && (
              <>
                <RadioOption
                  label={EVENTS_STRINGS.LIVE_STREAM}
                  description={EVENTS_STRINGS.PLATFORM_LIVESTREAM_DESCRIPTION}
                  isActive={platform === EventPlatform.Livestream}
                  onPress={() => setPlatform(EventPlatform.Livestream)}
                />
                <RadioOption
                  label={EVENTS_STRINGS.PLATFORM_EXTERNAL}
                  description={EVENTS_STRINGS.PLATFORM_EXTERNAL_DESCRIPTION}
                  isActive={platform === EventPlatform.External}
                  onPress={() => setPlatform(EventPlatform.External)}
                />
                {platform === EventPlatform.External && (
                  <TextInput
                    value={externalUrl}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="url"
                    onChangeText={setExternalUrl}
                    placeholder={EVENTS_STRINGS.EVENT_LINK}
                    placeholderTextColor={theme.colors.baseShade3}
                  />
                )}
              </>
            )}
            <RadioOption
              label={EVENT_TYPE_LABEL[AmityEventType.InPerson]}
              isActive={type === AmityEventType.InPerson}
              onPress={() => setType(AmityEventType.InPerson)}
            />
            {type === AmityEventType.InPerson && (
              <TextInput
                value={location}
                style={styles.input}
                onChangeText={setLocation}
                placeholder={EVENTS_STRINGS.ENTER_ADDRESS}
                placeholderTextColor={theme.colors.baseShade3}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.submitContainer}>
        <TouchableOpacity
          disabled={!canSubmit}
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
        >
          <Typography.BodyBold style={styles.submitButtonText}>
            {isCreateEvent ? EVENTS_STRINGS.CREATE_EVENT : EVENTS_STRINGS.SAVE}
          </Typography.BodyBold>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default memo(AmityEventSetupPage);
