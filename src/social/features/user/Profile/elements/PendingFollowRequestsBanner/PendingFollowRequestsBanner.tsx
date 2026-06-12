import { TouchableOpacity, View } from 'react-native';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useStyles } from './styles';

type PendingFollowRequestsBannerProps = {
  count: number;
  onPress: () => void;
};

export function PendingFollowRequestsBanner({
  count,
  onPress,
}: PendingFollowRequestsBannerProps) {
  const { styles } = useStyles();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.textContainer}>
        <View style={styles.dot} />
        <Typography.BodyBold style={styles.title}>
          New follow requests
        </Typography.BodyBold>
      </View>
      <Typography.Caption style={styles.subtitle}>
        {`${count} ${count === 1 ? 'request' : 'requests'} need your approval`}
      </Typography.Caption>
    </TouchableOpacity>
  );
}
