import { useEffect, useState } from 'react';
import AmityUserProfilePage from '../../features/user/Profile';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type UserProfileScreenProps = {
  defaultUserId?: string;
  isShowBackButton?: boolean;
};

export function UserProfileScreen({
  defaultUserId,
  isShowBackButton,
}: UserProfileScreenProps) {
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
