import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CameraRoll,
  type PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import { useStyles } from './styles';

type MediaSelectorProps = {
  visible: boolean;
  mediaType: 'photo' | 'video';
  /** URIs already added to the composer — used for silent duplicate detection. */
  existing: string[];
  /** How many more items may be added (10 - current count). */
  remaining: number;
  onClose: () => void;
  /** New, de-duplicated URIs in the order they were selected. */
  onConfirm: (uris: string[]) => void;
};

const PAGE_SIZE = 90;

async function ensureLibraryPermission(
  mediaType: 'photo' | 'video'
): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const version =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(Platform.Version, 10);
  const perms =
    version >= 33
      ? [
          mediaType === 'photo'
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]
      : [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
  try {
    const result = await PermissionsAndroid.requestMultiple(perms);
    return Object.values(result).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MediaSelector({
  visible,
  mediaType,
  existing,
  remaining,
  onClose,
  onConfirm,
}: MediaSelectorProps) {
  const { styles } = useStyles();
  const [items, setItems] = useState<PhotoIdentifier[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(
    async (after?: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await CameraRoll.getPhotos({
          first: PAGE_SIZE,
          after,
          assetType: mediaType === 'photo' ? 'Photos' : 'Videos',
          include: ['filename', 'playableDuration'],
        });
        setItems((prev) => (after ? [...prev, ...res.edges] : res.edges));
        setCursor(res.page_info.end_cursor);
        setHasNextPage(res.page_info.has_next_page);
      } catch {
        // permission denied / empty library — leave the list empty
      } finally {
        setLoading(false);
      }
    },
    [loading, mediaType]
  );

  // Reset and (re)load whenever the selector opens. A fresh open starts with an
  // empty selection; previously-added items are handled by duplicate detection.
  useEffect(() => {
    if (!visible) return;
    setSelected([]);
    setItems([]);
    setCursor(undefined);
    setHasNextPage(false);
    (async () => {
      const granted = await ensureLibraryPermission(mediaType);
      if (granted) loadPage();
    })();
  }, [visible, mediaType]);

  const toggle = useCallback(
    (uri: string) => {
      setSelected((prev) => {
        const index = prev.indexOf(uri);
        if (index !== -1) {
          // Deselect: removing from the array renumbers the rest automatically.
          return prev.filter((u) => u !== uri);
        }
        if (prev.length >= remaining) return prev; // respect the cap silently
        return [...prev, uri];
      });
    },
    [remaining]
  );

  const handleConfirm = useCallback(() => {
    const deduped = selected.filter((uri) => !existing.includes(uri));
    onConfirm(deduped);
  }, [selected, existing, onConfirm]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !loading) loadPage(cursor);
  }, [hasNextPage, loading, cursor, loadPage]);

  const renderItem = useCallback(
    ({ item }: { item: PhotoIdentifier }) => {
      const uri = item.node.image.uri;
      const order = selected.indexOf(uri);
      const isSelected = order !== -1;
      const duration =
        mediaType === 'video'
          ? formatDuration(item.node.image.playableDuration)
          : '';
      return (
        <TouchableWithoutFeedback onPress={() => toggle(uri)}>
          <View style={styles.cell}>
            <Image style={styles.cell__image} source={{ uri }} />
            {!!duration && (
              <Text style={styles.cell__videoDuration}>{duration}</Text>
            )}
            {isSelected ? (
              <>
                <View style={styles.cell__selectedOverlay} />
                <View style={styles.cell__badge}>
                  <Text style={styles.cell__badgeLabel}>{order + 1}</Text>
                </View>
              </>
            ) : (
              <View style={styles.cell__badgeEmpty} />
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    },
    [selected, mediaType, toggle, styles]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Text style={styles.headerClose}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mediaType === 'photo' ? 'Photos' : 'Videos'}
          </Text>
          <TouchableOpacity
            style={styles.headerButton__right}
            disabled={selected.length === 0}
            onPress={handleConfirm}
          >
            <Text
              style={
                selected.length === 0
                  ? styles.headerAdd__disabled
                  : styles.headerAdd
              }
            >
              {selected.length > 0 ? `Add (${selected.length})` : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          numColumns={3}
          keyExtractor={(item) => item.node.image.uri}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.6}
          initialNumToRender={30}
          windowSize={5}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.empty__text}>
                  No {mediaType === 'photo' ? 'photos' : 'videos'} found on this
                  device.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}
