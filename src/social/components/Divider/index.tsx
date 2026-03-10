import { View } from 'react-native';
import { useStyles } from './styles';

function Divider() {
  const { styles } = useStyles();

  return <View style={styles.divider} />;
}

export default Divider;
