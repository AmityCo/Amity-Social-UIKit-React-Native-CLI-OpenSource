import React from 'react';
import { ElementID, PageID } from '~/v4/enum';
import { Alert, View } from 'react-native';
import { Title } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';
import BackButton from '~/v4/elements/BackButton';

type HeaderProps = {
  isFormDirty: boolean;
};

function Header({ isFormDirty }: HeaderProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <BackButton
        pageId={PageID.community_setup_page}
        onPress={() => {
          if (!isFormDirty) return navigation.goBack();
          Alert.alert(
            'Leave without finishing?',
            'Your changes that you made may not be saved.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Leave',
                style: 'destructive',
                onPress: navigation.goBack,
              },
            ]
          );
        }}
      />
      <Title
        pageId={PageID.community_setup_page}
        elementId={ElementID.community_edit_title}
      />
      <View style={styles.dummy} />
    </View>
  );
}

export default Header;
