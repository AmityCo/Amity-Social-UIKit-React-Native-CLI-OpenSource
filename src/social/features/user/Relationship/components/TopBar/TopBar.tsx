import { View } from 'react-native';
import { useStyles } from './styles';
import BackButton from '../../../../../elements/BackButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { PageID } from '../../../../../enums';

type TopBarProps = {
  displayName: string;
};

export function TopBar({ displayName }: TopBarProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <BackButton
        pageId={PageID.user_relationship_page}
        onPress={navigation.goBack}
      />
      <Typography.TitleBold
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.displayName}
      >
        {displayName}
      </Typography.TitleBold>
      <View style={styles.dummy} />
    </View>
  );
}
