import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import BackButton from '../../../../../elements/BackButton';
import Title from '../../../../../elements/Title';
import { PageID } from '../../../../../enums';
import { useStyles } from './styles';

type TopBarProps = {
  count: number;
};

export function TopBar({ count }: TopBarProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <BackButton
        pageId={PageID.user_pending_follow_request_page}
        onPress={navigation.goBack}
      />
      <Title style={styles.title}>{`Follow requests (${count})`}</Title>
      <View style={styles.dummy} />
    </View>
  );
}
