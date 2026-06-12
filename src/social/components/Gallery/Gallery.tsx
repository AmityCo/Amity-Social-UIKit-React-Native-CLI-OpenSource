import { useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useStyles } from './styles';
import Skeleton from '../../../core/components/Skeleton/Skeleton';
import { Typography } from '../../../core/components/Typography/Typography';
import { formatDuration } from '../../../core/utils/time';
import { Empty, EmptyContentProps, EmptyProps } from '../Empty';

type GalleryProps<T> = {
  data: T[];
  isLoading?: boolean;
  renderEmpty?: () => React.ReactElement;
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  testID?: string;
};

export function Gallery<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading,
  renderEmpty,
  testID,
}: GalleryProps<T>) {
  const { styles } = useStyles();

  return (
    <View testID={testID} style={styles.container}>
      <FlatList
        data={data}
        numColumns={2}
        scrollEnabled={false}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={RowSeparator}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={isLoading ? null : renderEmpty?.()}
        ListFooterComponent={isLoading ? <GallerySkeleton /> : null}
      />
    </View>
  );
}

type GalleryItemProps = {
  uri: string;
  timestamp?: number;
  onPress: () => void;
};

function GalleryItem({ uri, timestamp, onPress }: GalleryItemProps) {
  const { styles } = useStyles();
  const [hasError, setHasError] = useState(false);

  return (
    <TouchableOpacity
      hitSlop={0.8}
      onPress={onPress}
      disabled={hasError}
      style={styles.cell}
    >
      {hasError ? (
        <Skeleton.Square
          radius={8}
          width="100%"
          height="100%"
          shimmer={false}
        />
      ) : (
        <>
          <Image
            style={styles.cellImage}
            source={{ uri }}
            onError={() => setHasError(true)}
          />
          {timestamp !== undefined && (
            <View style={styles.timestampContainer}>
              <Typography.Caption style={styles.timestamp}>
                {formatDuration(timestamp)}
              </Typography.Caption>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const NUM_ROWS = 3;

function GallerySkeleton() {
  const { styles } = useStyles();

  return (
    <Skeleton>
      {Array.from({ length: NUM_ROWS }).map((_, i) => (
        <Skeleton key={i}>
          <Skeleton style={styles.columnWrapper}>
            <Skeleton style={styles.cell}>
              <Skeleton.Square width="100%" height="100%" radius={8} />
            </Skeleton>
            <Skeleton style={styles.cell}>
              <Skeleton.Square width="100%" height="100%" radius={8} />
            </Skeleton>
          </Skeleton>
          {i < NUM_ROWS - 1 && <Skeleton style={styles.rowSeparator} />}
        </Skeleton>
      ))}
    </Skeleton>
  );
}

function RowSeparator() {
  const { styles } = useStyles();
  return <View style={styles.rowSeparator} />;
}

type GalleryEmptyProps = EmptyContentProps & Pick<EmptyProps, 'heightPercent'>;

function GalleryEmpty({ heightPercent = 0.4, ...props }: GalleryEmptyProps) {
  return (
    <Empty heightPercent={heightPercent}>
      <Empty.Content {...props} />
    </Empty>
  );
}

Gallery.Item = GalleryItem;

Gallery.Skeleton = GallerySkeleton;

Gallery.Empty = GalleryEmpty;

Gallery.Separator = RowSeparator;
