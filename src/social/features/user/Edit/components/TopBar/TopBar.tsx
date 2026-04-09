import { Alert, View } from 'react-native';
import { useStyles } from './styles';
import BackButton from '../../../../../elements/BackButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import { Title } from '../../../../../elements';
import { ElementID, PageID } from '../../../../../enums';

type TopBarProps = {
  isFormDirty?: boolean;
};

export function TopBar({ isFormDirty }: TopBarProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onBackPress = () => {
    if (isFormDirty) {
      Alert.alert(
        'Unsaved changes',
        'Are you sure you want to discard the changes? They will be lost when you leave this page.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: navigation.goBack,
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <BackButton
        pageId={PageID.edit_user_profile_page}
        onPress={onBackPress}
      />
      <Title
        pageId={PageID.edit_user_profile_page}
        elementId={ElementID.title}
      />
      <View style={styles.dummy} />
    </View>
  );
}
