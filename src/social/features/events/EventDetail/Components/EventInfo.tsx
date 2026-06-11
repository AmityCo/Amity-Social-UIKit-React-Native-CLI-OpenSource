import { FC, memo, useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmityEventStatus, AmityEventType } from '@amityco/ts-sdk-react-native';
import { eventCopy } from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import LivestreamContent from '../../../../components/LivestreamContent';
import { EVENTS_STRINGS } from '../../constants';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAmityComponent } from '../../../../hooks';
import { ComponentID, PageID } from '../../../../enums';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';

const DESCRIPTION_MAX_LINES = 10;

type EventInfoProps = {
  pageId?: PageID;
  event: Amity.Event;
};

const CopyRowButton = ({
  text,
  toastMessage,
}: {
  text: string;
  toastMessage: string;
}) => {
  const componentId = ComponentID.event_info;
  const { themeStyles } = useAmityComponent({
    pageId: PageID.event_detail_page,
    componentId,
  });
  const { showToast } = useToast();

  const styles = StyleSheet.create({
    button: {
      gap: 8,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderColor:
        themeStyles.colors.secondaryShade3 ?? themeStyles.colors.baseShade3,
    },
    label: {
      color: themeStyles.colors.base,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      accessibilityLabel="Copy link to clipboard"
      onPress={() => {
        try {
          Clipboard.setString(text);
          showToast({ message: toastMessage, type: 'success' });
        } catch {
          showToast({
            message: EVENTS_STRINGS.FAILED_TO_COPY_LINK,
            type: 'informative',
          });
        }
      }}
    >
      <SvgXml
        xml={eventCopy()}
        width={20}
        height={20}
        color={themeStyles.colors.base}
      />
      <Typography.BodyBold style={styles.label}>
        {EVENTS_STRINGS.COPY}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
};

/**
 * Web parity: EventInfo (About tab) — about text with see-more truncation,
 * then per-type section: external link + copy, livestream preview, or
 * in-person address + copy.
 */
const EventInfo: FC<EventInfoProps> = ({
  pageId = PageID.event_detail_page,
  event,
}) => {
  const componentId = ComponentID.event_info;
  const { accessibilityId, isExcluded, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });
  const { AmityEventDetailPageBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);

  const onDescriptionTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!showFullDescription) {
        setIsDescriptionTruncated(
          e.nativeEvent.lines.length >= DESCRIPTION_MAX_LINES
        );
      }
    },
    [showFullDescription]
  );

  const onPressLivestreamPost = useCallback(() => {
    if (AmityEventDetailPageBehaviour?.goToPostDetailPage) {
      return AmityEventDetailPageBehaviour.goToPostDetailPage({
        postId: event.postId,
      });
    }
    navigation.navigate('PostDetail', { postId: event.postId });
  }, [AmityEventDetailPageBehaviour, navigation, event.postId]);

  const styles = StyleSheet.create({
    container: {
      paddingBottom: 48,
      backgroundColor: themeStyles.colors.background,
    },
    section: {
      gap: 12,
      padding: 16,
    },
    text: {
      color: themeStyles.colors.base,
    },
    link: {
      color: themeStyles.colors.primary,
    },
    subTitle: {
      color: themeStyles.colors.baseShade1,
    },
    seeMore: {
      color: themeStyles.colors.primary,
    },
    row: {
      gap: 12,
    },
  });

  if (isExcluded) return null;

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <View style={styles.section}>
        <Typography.TitleBold style={styles.text}>
          {EVENTS_STRINGS.ABOUT_THE_EVENT}
        </Typography.TitleBold>
        <Typography.Body
          style={styles.text}
          onTextLayout={onDescriptionTextLayout}
          numberOfLines={
            showFullDescription ? undefined : DESCRIPTION_MAX_LINES
          }
        >
          {event.description || ''}
        </Typography.Body>
        {isDescriptionTruncated && !showFullDescription && (
          <TouchableOpacity onPress={() => setShowFullDescription(true)}>
            <Typography.Body style={styles.seeMore}>See more</Typography.Body>
          </TouchableOpacity>
        )}
      </View>
      {event.type === AmityEventType.Virtual ? (
        event.externalUrl ? (
          <View style={styles.section}>
            <Typography.TitleBold style={styles.text}>
              {EVENTS_STRINGS.EVENT_LINK}
            </Typography.TitleBold>
            <View style={styles.row}>
              <Typography.Body style={styles.link}>
                {event.externalUrl}
              </Typography.Body>
              <CopyRowButton
                text={event.externalUrl}
                toastMessage={EVENTS_STRINGS.LINK_COPIED}
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View>
              <Typography.TitleBold style={styles.text}>
                {EVENTS_STRINGS.LIVE_STREAM}
              </Typography.TitleBold>
              {event.status === AmityEventStatus.Scheduled && (
                <Typography.Caption style={styles.subTitle}>
                  {EVENTS_STRINGS.LIVE_SETUP_HINT}
                </Typography.Caption>
              )}
            </View>
            {event.post && (
              <LivestreamContent
                post={event.post}
                roomId={event.room?.roomId}
                onPressPost={onPressLivestreamPost}
              />
            )}
          </View>
        )
      ) : (
        <View style={styles.section}>
          <Typography.TitleBold style={styles.text}>
            {EVENTS_STRINGS.EVENT_ADDRESS}
          </Typography.TitleBold>
          <View style={styles.row}>
            <Typography.Body style={styles.text}>
              {event.location || ''}
            </Typography.Body>
            <CopyRowButton
              text={event.location || ''}
              toastMessage={EVENTS_STRINGS.ADDRESS_COPIED}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default memo(EventInfo);
