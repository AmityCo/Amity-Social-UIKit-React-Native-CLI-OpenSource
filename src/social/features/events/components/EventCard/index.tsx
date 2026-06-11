import { memo, useCallback, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import EventTypeBadge from '../EventTypeBadge';
import EventHostBadge from '../EventHostBadge';
import { brandBadge } from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { formatEventDuration } from '../../utils';
import { EVENTS_STRINGS } from '../../constants';
import { useGlobalBehavior } from '../../../../hooks/useGlobalBehavior';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import useAuth from '../../../../../core/hooks/useAuth';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';

const eventDefaultThumbnail = require('../../../../../core/assets/images/eventDefaultThumbnail.png');

type EventCardProps = {
  event: Amity.Event;
  variant?: 'card' | 'list';
  size?: 'lg' | 'md';
};

const EventCard = ({
  event,
  variant = 'card',
  size = 'lg',
}: EventCardProps) => {
  const { styles } = useStyles();
  const { client } = useAuth();
  const { handleGlobalBehavior } = useGlobalBehavior();
  const { AmityEventsPageBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [errorImage, setErrorImage] = useState(false);

  const currentUserId = (client as Amity.Client)?.userId;
  const isHostEvent = event.userId === currentUserId;
  const creatorName =
    event.creator?.displayName ?? (event as Amity.Event).userPublicId ?? '';

  const coverImageSource =
    !errorImage && event.coverImage?.fileUrl
      ? {
          uri: FileRepository.fileUrlWithSize(
            event.coverImage.fileUrl,
            'medium'
          ),
        }
      : eventDefaultThumbnail;

  // Web parity: card click is gated for visitors via handleGlobalBehavior
  const onPressCard = useCallback(() => {
    handleGlobalBehavior({
      defaultBehavior: () => {
        if (AmityEventsPageBehaviour?.goToEventDetailPage) {
          return AmityEventsPageBehaviour.goToEventDetailPage({
            eventId: event.eventId,
          });
        }
        navigation.navigate('EventDetail', { eventId: event.eventId });
      },
    });
  }, [
    handleGlobalBehavior,
    AmityEventsPageBehaviour,
    navigation,
    event.eventId,
  ]);

  const containerStyle =
    variant === 'list'
      ? styles.list
      : size === 'md'
      ? styles.cardMd
      : styles.cardLg;
  const figureStyle =
    variant === 'list'
      ? styles.figureList
      : size === 'md'
      ? styles.figureCardMd
      : styles.figureCardLg;
  const imageStyle =
    variant === 'card' && size === 'md' ? styles.imageCardMd : styles.image;
  const titleLines = variant === 'card' && size === 'md' ? 1 : 2;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={containerStyle}
      onPress={onPressCard}
      accessibilityLabel={`click to go event ${event.title} details`}
    >
      <View style={figureStyle}>
        <Image
          style={imageStyle}
          resizeMode="cover"
          source={coverImageSource}
          onError={() => setErrorImage(true)}
        />
        <View style={styles.eventTypeBadge}>
          <EventTypeBadge type={event.type} />
        </View>
        {isHostEvent && (
          <View style={styles.hostBadge}>
            <EventHostBadge />
          </View>
        )}
      </View>
      <View
        style={[
          styles.info,
          variant === 'card' && size === 'md' && styles.infoCardMd,
        ]}
      >
        <Typography.CaptionBold style={styles.duration}>
          {formatEventDuration(event.startTime, event.endTime)}
        </Typography.CaptionBold>
        <Typography.BodyBold style={styles.title} numberOfLines={titleLines}>
          {event.title}
        </Typography.BodyBold>
        <View style={styles.creatorRow}>
          <Typography.Body style={styles.creatorName} numberOfLines={1}>
            {EVENTS_STRINGS.BY_CREATOR(creatorName)}
          </Typography.Body>
          {event.creator?.isBrand && (
            <SvgXml xml={brandBadge()} width={16} height={16} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(EventCard);
