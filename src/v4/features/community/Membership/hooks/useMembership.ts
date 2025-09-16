import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useToast } from '~/v4/stores/slices/toast';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

type AddCommunityMembersPayload = Parameters<
  typeof CommunityRepository.Membership.addMembers
>[1];

type AddCommunityMembersResponse = Awaited<
  ReturnType<typeof CommunityRepository.Membership.addMembers>
>;

type UseMembership = {
  community: Amity.Community;
};

export type Tab = 'members' | 'moderators';

export const useMembership = ({ community }: UseMembership) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CommunityMembership'>
    >();

  const { mutateAsync: addMembers } = useMutation<
    AddCommunityMembersResponse,
    Error,
    AddCommunityMembersPayload
  >({
    mutationFn: (userIds) =>
      CommunityRepository.Membership.addMembers(community.communityId, userIds),
    onSuccess: () => {
      navigation.goBack();
      showToast({
        type: 'success',
        message: 'Successfully added member to this community.',
      });
    },
    onError: () => {
      showToast({
        type: 'failed',
        message: 'Failed to add member. Please try again.',
      });
    },
  });

  const onAddMember = async (users: Amity.User[]) => {
    await addMembers(users.map((user) => user.userId));
  };

  return {
    navigation,
    onAddMember,
    activeTab,
    setActiveTab,
  };
};
