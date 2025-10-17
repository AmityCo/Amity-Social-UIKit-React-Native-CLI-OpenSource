import React from 'react';
import { PageID } from '~/v4/enum';
import { Alert, View } from 'react-native';
import { Title, CloseButton } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';

type HeaderProps = {
  isFormDirty: boolean;
};

function Header({ isFormDirty }: HeaderProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <CloseButton
        pageId={PageID.community_setup_page}
        onPress={() => {
          if (!isFormDirty) return navigation.goBack();
          Alert.alert(
            'Leave without finishing?',
            "Your progress won't be saved and your community won't be created.",
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
      <Title pageId={PageID.community_setup_page} />
      <View style={styles.dummy} />
    </View>
  );
}

export default Header;
