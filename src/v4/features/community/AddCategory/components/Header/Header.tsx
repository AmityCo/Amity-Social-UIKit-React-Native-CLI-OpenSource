import React from 'react';
import { View } from 'react-native';
import { Title, CloseButton } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';
import { Typography } from '~/v4/component/Typography/Typography';

type HeaderProps = {
  count: number;
  total: number;
  bordered?: boolean;
};

function Header({ count, total, bordered }: HeaderProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.container, bordered && styles.border]}>
      <CloseButton onPress={navigation.goBack} />
      <Title>Select category</Title>
      <Typography.Caption style={styles.categoryCount}>
        {count}/{total}
      </Typography.Caption>
    </View>
  );
}

export default Header;
