import {
  Image,
  TouchableOpacity,
  View,
  ImageSourcePropType,
  Pressable,
  ImageStyle,
} from 'react-native';
import { useEffect, useState, useCallback, Fragment, memo } from 'react';
import { FileRepository, RoomRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { play } from '../../../core/assets/icons';
import { Typography } from '../../../core/components/Typography/Typography';
import { RoomStatus } from '../../enums/roomStatus';
import LiveStreamEndThumbnail from './LivestreamEndedThumbnail';
import LiveStreamIdleThumbnail from './LivestreamIdleThumbnail';
import RenderTextWithMention from '../RenderTextWithMention/RenderTextWithMention';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import LiveStreamTerminatedThumbnail from './LivestreamTerminatedThumbnail';

interface ILivestreamContent {
  roomId: Amity.Room['roomId'];
  onPressPost: () => void;
  post: Amity.Post;
}

const LivestreamContent: React.FC<ILivestreamContent> = ({
  post,
  roomId,
  onPressPost,
}) => {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'LivestreamPlayer'>
    >();

  const [error, setError] = useState<boolean>(false);
  const [livestream, setLivestream] = useState<Amity.Room>();
  const [thumbnailUrl, setThumbnailUrl] = useState<ImageSourcePropType>();
  const [isUpcoming, setIsUpcoming] = useState<boolean>(false);

  const onPlayLivestream = useCallback(() => {
    navigation.navigate('LivestreamPlayer', {
      post,
      roomId: livestream.roomId,
    });
  }, [livestream, navigation, post]);

  const getLivestreamThumbnail = async (currentStream: Amity.Room) => {
    const defaultThumbnail = require('../../../core/assets/images/livestream.png');

    if (currentStream.thumbnailFileId) {
      const file = await FileRepository.getFile(currentStream.thumbnailFileId);

      if (file) {
        const fileUrl = FileRepository.fileUrlWithSize(
          file.data.fileUrl,
          'full'
        );

        setThumbnailUrl({ uri: fileUrl });
        return;
      }
    }
    setThumbnailUrl(defaultThumbnail);
  };

  useEffect(() => {
    setIsUpcoming(true);
    const unsubscribe = RoomRepository.getRoom(
      roomId,
      ({ data, loading, error: streamError }) => {
        if (streamError) setError(!!streamError);
        if (!loading && data) {
          setLivestream(data);
          getLivestreamThumbnail(data);
        }
        setIsUpcoming(loading);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  if (!livestream) return null;

  if (error || livestream?.isDeleted) {
    return (
      <View key={livestream.roomId} style={styles.container}>
        <LiveStreamIdleThumbnail />
      </View>
    );
  }

  const isTerminated =
    livestream?.moderation?.terminateLabels &&
    livestream?.moderation?.terminateLabels?.length > 0;
  const isLiveOrEnded =
    livestream?.status === RoomStatus.live ||
    livestream?.status === RoomStatus.ended;

  if (isTerminated && isLiveOrEnded) {
    return (
      <View key={livestream.roomId} style={styles.container}>
        <LiveStreamTerminatedThumbnail />
      </View>
    );
  }

  return (
    <Fragment>
      <Pressable onPress={onPressPost} style={styles.info}>
        <RenderTextWithMention
          isTitle
          mentionPositionArr={[]}
          textPost={livestream.title}
        />
        {livestream.description && (
          <RenderTextWithMention
            mentionPositionArr={[]}
            textPost={livestream.description}
          />
        )}
      </Pressable>
      <View style={styles.container}>
        {(livestream.status === RoomStatus.idle || isUpcoming) &&
          thumbnailUrl && (
            <View style={styles.content}>
              <Image
                source={thumbnailUrl}
                style={styles.streamImageCover as ImageStyle}
              />
              <View style={styles.streamStatusRecorded}>
                <Typography.CaptionBold style={styles.streamStatusText}>
                  UPCOMING LIVE
                </Typography.CaptionBold>
              </View>
            </View>
          )}

        {livestream.status === RoomStatus.ended && <LiveStreamEndThumbnail />}

        {(livestream.status === RoomStatus.live ||
          livestream.status === RoomStatus.recorded ||
          livestream.status === RoomStatus.waitingReconnect) &&
          thumbnailUrl &&
          !isUpcoming && (
            <View style={styles.content}>
              <Image
                source={thumbnailUrl}
                style={styles.streamImageCover as ImageStyle}
              />
              {(livestream.status === RoomStatus.live ||
                livestream.status === RoomStatus.waitingReconnect) && (
                <View style={styles.streamStatusLive}>
                  <Typography.CaptionBold style={styles.streamStatusText}>
                    LIVE
                  </Typography.CaptionBold>
                </View>
              )}
              {livestream.status === RoomStatus.recorded && (
                <View style={styles.streamStatusRecorded}>
                  <Typography.CaptionBold style={styles.streamStatusText}>
                    RECORDED
                  </Typography.CaptionBold>
                </View>
              )}
              <TouchableOpacity
                onPress={onPlayLivestream}
                style={styles.streamPlayButton}
              >
                <SvgXml
                  width="40"
                  height="40"
                  xml={play()}
                  color={theme.colors.background}
                />
              </TouchableOpacity>
            </View>
          )}
      </View>
    </Fragment>
  );
};

export default memo(LivestreamContent);
