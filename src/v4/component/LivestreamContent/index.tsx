import {
  Image,
  TouchableOpacity,
  View,
  ImageSourcePropType,
  Pressable,
} from 'react-native';
import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { FileRepository, StreamRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { play } from '../../assets/icons';
import { Typography } from '../Typography/Typography';
import { LivestreamStatus } from '../../enum/livestreamStatus';
import LiveStreamEndThumbnail from './LivestreamEndedThumbnail';
import LiveStreamIdleThumbnail from './LivestreamIdleThumbnail';
import RenderTextWithMention from '../../component/RenderTextWithMention/RenderTextWithMention';
import { RootStackParamList } from '../../routes/RouteParamList';
import LiveStreamTerminatedThumbnail from './LivestreamTerminatedThumbnail';

interface ILivestreamContent {
  streamId: Amity.Stream['streamId'];
  onPressPost: () => void;
  post: Amity.Post;
}

const LivestreamContent: React.FC<ILivestreamContent> = ({
  post,
  streamId,
  onPressPost,
}) => {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'LivestreamPlayer'>
    >();

  const [error, setError] = useState<boolean>(false);
  const [livestream, setLivestream] = useState<Amity.Stream>();
  const [thumbnailUrl, setThumbnailUrl] = useState<ImageSourcePropType>();
  const [isUpcoming, setIsUpcoming] = useState<boolean>(false);

  const onPlayLivestream = useCallback(() => {
    navigation.navigate('LivestreamPlayer', {
      post,
      streamId: livestream.streamId,
    });
  }, [livestream, navigation, post]);

  const getLivestreamThumbnail = async (currentStream: Amity.Stream) => {
    const defaultThumbnail = require('../../assets/images/livestream.png');

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
    const unsubscribe = StreamRepository.getStreamById(
      streamId,
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
  }, [streamId]);

  if (!livestream) return null;

  if (error || livestream?.isDeleted) {
    return (
      <View key={livestream.streamId} style={styles.container}>
        <LiveStreamIdleThumbnail />
      </View>
    );
  }

  const isTerminated =
    livestream?.moderation?.terminateLabels &&
    livestream?.moderation?.terminateLabels?.length > 0;
  const isLiveOrEnded =
    livestream?.status === LivestreamStatus.live ||
    livestream?.status === LivestreamStatus.ended;

  if (isTerminated && isLiveOrEnded) {
    return (
      <View key={livestream.streamId} style={styles.container}>
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
        {(livestream.status === LivestreamStatus.idle || isUpcoming) &&
          thumbnailUrl && (
            <View style={styles.content}>
              <Image source={thumbnailUrl} style={styles.streamImageCover} />
              <View style={styles.streamStatusRecorded}>
                <Typography.CaptionBold style={styles.streamStatusText}>
                  UPCOMING LIVE
                </Typography.CaptionBold>
              </View>
            </View>
          )}

        {livestream.status === LivestreamStatus.ended && (
          <LiveStreamEndThumbnail />
        )}

        {(livestream.status === LivestreamStatus.live ||
          livestream.status === LivestreamStatus.recorded) &&
          thumbnailUrl &&
          !isUpcoming && (
            <View style={styles.content}>
              <Image source={thumbnailUrl} style={styles.streamImageCover} />
              {livestream.status === LivestreamStatus.live && (
                <View style={styles.streamStatusLive}>
                  <Typography.CaptionBold style={styles.streamStatusText}>
                    LIVE
                  </Typography.CaptionBold>
                </View>
              )}
              {livestream.status === LivestreamStatus.recorded && (
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

export default React.memo(LivestreamContent);
