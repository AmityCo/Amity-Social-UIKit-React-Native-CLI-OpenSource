import React, { useEffect, useState } from 'react';
import AmityUserProfilePage from '../../PublicApi/Pages/AmityUserProfilePage';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type UserProfileProps = {
  defaultUserId?: string;
  isShowBackButton?: boolean;
};

function UserProfile({ defaultUserId, isShowBackButton }: UserProfileProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userIdFromRoute = route?.params?.userId;
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const routes = navigation.getState().routes;

    if (defaultUserId && routes.length === 1) {
      setUserId(defaultUserId);
    } else if (userIdFromRoute) {
      setUserId(userIdFromRoute);
    }
    return () => {
      setUserId('');
    };
  }, [defaultUserId, navigation, userIdFromRoute]);

  return (
    <AmityUserProfilePage
      userId={userId}
      isFromComponent={!!defaultUserId && !userIdFromRoute}
      isShowBackButton={isShowBackButton ? isShowBackButton : !defaultUserId}
    />
  );
}

export default UserProfile;
