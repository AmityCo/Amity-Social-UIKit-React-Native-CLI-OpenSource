import React from 'react';
import AmityUserProfilePage from '../../PublicApi/Pages/AmityUserProfilePage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type UserProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfile'
>;

function UserProfile(_: UserProfileProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const userId = route?.params?.userId;

  return <AmityUserProfilePage userId={userId} />;
}

export default UserProfile;
