import React from 'react';
import { View } from 'react-native';
import { Title } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';
import BackButton from '~/v4/elements/BackButton';

function Header() {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <BackButton onPress={navigation.goBack} />
      <Title numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
        Story comments
      </Title>
      <View style={styles.dummy} />
    </View>
  );
}

export default Header;
