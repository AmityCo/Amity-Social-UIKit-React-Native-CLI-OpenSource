import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Title } from '~/v4/elements';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStyles } from './styles';
import BackButton from '~/v4/elements/BackButton';
import { SvgXml } from 'react-native-svg';
import { plus } from '~/v4/assets/icons';
import { useBehaviour } from '~/v4/providers/BehaviourProvider';

type HeaderProps = {
  onAddMember: (users: Amity.User[]) => void;
};

function Header({ onAddMember }: HeaderProps) {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { AmityCommunityMembershipPageBehavior } = useBehaviour();

  return (
    <View style={styles.container}>
      <BackButton onPress={navigation.goBack} />
      <Title numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
        All members
      </Title>
      {onAddMember ? (
        <TouchableOpacity
          onPress={() => {
            if (AmityCommunityMembershipPageBehavior.goToAddMemberPage) {
              return AmityCommunityMembershipPageBehavior.goToAddMemberPage({
                users: [],
                onAddedAction: onAddMember,
              });
            }
            navigation.navigate('CommunityAddMember', {
              users: [],
              onAddedAction: onAddMember,
            });
          }}
        >
          <SvgXml
            xml={plus()}
            width={24}
            height={24}
            color={theme.colors.base}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.dummy} />
      )}
    </View>
  );
}

export default Header;
