import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageStyle,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { SvgXml } from 'react-native-svg';
import {
  clearIcon,
  soundOnIcon,
  soundOffIcon,
} from '../../../core/assets/icons/xml';
import { useStyles } from './styles';

export type MediaViewerItem = {
  type: 'image' | 'video';
  uri: string;
  /** e.g. 'm3u8' for HLS (published) videos; omit for local files. */
  videoType?: string;
};

type MediaViewerProps = {
  visible: boolean;
  items: MediaViewerItem[];
  initialIndex: number;
  /** Called with the last-viewed index so the caller can decide where to
   * return (published: last-viewed; composer: originally-tapped). */
  onClose: (lastIndex: number) => void;
};

export function MediaViewer({
  visible,
  items,
  initialIndex,
  onClose,
}: MediaViewerProps) {
  const { styles } = useStyles();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<MediaViewerItem>>(null);
  const [current, setCurrent] = useState(initialIndex);
  // Mute-carry (PDT-4309 / PDT-4312): the first video plays unmuted; each swipe
  // defaults the next video to muted — until the user unmutes, after which
  // subsequent videos stay unmuted.
  const [muted, setMuted] = useState(false);
  const keepUnmutedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    setCurrent(initialIndex);
    setMuted(false);
    keepUnmutedRef.current = false;
  }, [visible, initialIndex]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!width) return;
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (idx !== current) {
        setCurrent(idx);
        setMuted(!keepUnmutedRef.current);
      }
    },
    [width, current]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      keepUnmutedRef.current = !next; // user unmuted -> keep unmuted afterwards
      return next;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: MediaViewerItem; index: number }) => (
      <View style={[styles.page, { width }]}>
        {item.type === 'video' ? (
          // pointerEvents none so horizontal swipes reach the pager instead of
          // being captured by the native video view.
          <View style={styles.media} pointerEvents="none">
            <Video
              source={
                item.videoType
                  ? { uri: item.uri, type: item.videoType }
                  : { uri: item.uri }
              }
              style={styles.media}
              resizeMode="contain"
              paused={index !== current || !visible}
              muted={muted && index === current}
              repeat
              playInBackground={false}
              playWhenInactive={false}
            />
          </View>
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.media as StyleProp<ImageStyle>}
            resizeMode="contain"
          />
        )}
      </View>
    ),
    [styles, width, current, muted, visible]
  );

  const currentIsVideo = items[current]?.type === 'video';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(current)}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => onClose(current)}
          >
            <SvgXml xml={clearIcon('white')} width={28} height={28} />
          </TouchableOpacity>
          <Text style={styles.counter}>
            {current + 1}/{items.length}
          </Text>
          <View style={styles.headerBtn__right}>
            {currentIsVideo && (
              <TouchableOpacity onPress={toggleMute}>
                <SvgXml
                  xml={muted ? soundOffIcon('#FFFFFF') : soundOnIcon('#FFFFFF')}
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlatList
          ref={listRef}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(it, i) => `${it.uri}-${i}`}
          renderItem={renderItem}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialScrollIndex={initialIndex}
          onMomentumScrollEnd={onMomentumScrollEnd}
        />
      </View>
    </Modal>
  );
}
