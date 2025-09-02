import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { Title, CloseButton } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

function Header() {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <CloseButton onPress={navigation.goBack} />
      <Title>Add member</Title>
      <View style={styles.dummy} />
    </View>
  );
}

export default Header;
