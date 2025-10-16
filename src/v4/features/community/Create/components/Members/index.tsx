import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { ElementID, PageID } from '~/v4/enum';
import FormLabel from '~/v4/elements/FormLabel';
import { useNavigation } from '@react-navigation/native';
import { useBehaviour } from '~/v4/providers/BehaviourProvider';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { MemberChip } from '~/v4/component/MemberChip/MemberChip';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CommunityAddMemberButton from '~/v4/elements/CommunityAddMemberButton';

type MembersProps = {
  value: Amity.User[];
  goBack: () => void;
  onChange: (users: Amity.User[]) => void;
};

function Members({ value, goBack, onChange }: MembersProps) {
  const { styles } = useStyles();
  const { AmityCommunitySetupPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onAddedAction = (users: Amity.User[]) => {
    goBack();
    onChange(users);
  };

  return (
    <View style={styles.container}>
      <FormLabel
        pageId={PageID.community_setup_page}
        elementId={ElementID.community_add_member_title}
      />
      <View style={styles.memberContainer}>
        <CommunityAddMemberButton
          pageId={PageID.community_setup_page}
          onPress={() => {
            if (AmityCommunitySetupPageBehavior.goToAddMemberPage) {
              return AmityCommunitySetupPageBehavior.goToAddMemberPage({
                users: value,
                onAddedAction,
              });
            }
            navigation.navigate('CommunityAddMember', {
              users: value,
              onAddedAction,
            });
          }}
        />
        {value.length > 0 &&
          value.map((member) => (
            <View style={styles.selectedMemberContainer} key={member.userId}>
              <MemberChip
                member={member}
                onPress={(deletedMember) => {
                  onChange(
                    value.filter((m) => m.userId !== deletedMember.userId)
                  );
                }}
              />
            </View>
          ))}
      </View>
    </View>
  );
}

export default Members;
