import React from 'react';
import { Alert, View } from 'react-native';
import { Title } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';
import BackButton from '~/v4/elements/BackButton';
import Button from '~/v4/component/Button/Button';

type HeaderProps = {
  onSave: () => void;
  disabled?: boolean;
  isFormDirty: boolean;
};

function Header({ onSave, disabled, isFormDirty }: HeaderProps) {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <BackButton
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
      <Title numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
        Comments
      </Title>
      <Button
        type="inline"
        onPress={onSave}
        themeStyle={theme}
        disabled={disabled}
      >
        Save
      </Button>
    </View>
  );
}

export default Header;
