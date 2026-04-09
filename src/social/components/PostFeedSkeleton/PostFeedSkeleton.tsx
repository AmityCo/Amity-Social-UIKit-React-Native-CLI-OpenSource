import { useStyles } from './styles';
import Skeleton from '../../../core/components/Skeleton/Skeleton';

function PostFeedSkeleton() {
  const { styles } = useStyles();

  return Array.from({ length: 3 }, (_, index) => (
    <Skeleton
      style={[styles.container, index < 2 && styles.divider]}
      key={index}
    >
      <Skeleton style={styles.header}>
        <Skeleton.Circle width={32} height={32} />
        <Skeleton style={styles.title}>
          <Skeleton.Line width={180} height={8} />
          <Skeleton.Line width={64} height={8} />
        </Skeleton>
      </Skeleton>
      <Skeleton.Line width={240} height={8} bottom={12} />
      <Skeleton.Line width={180} height={8} bottom={12} />
      <Skeleton.Line width={300} height={8} bottom={12} />
    </Skeleton>
  ));
}

export default PostFeedSkeleton;
