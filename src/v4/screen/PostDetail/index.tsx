import React, { useEffect, useState } from 'react';
import AmityPostDetailPage from '../../PublicApi/Pages/AmityPostDetailPage/AmityPostDetailPage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type IPostDetailPage = {
  defaultPostId?: string;
};

const PostDetail: React.FC<IPostDetailPage> = ({ defaultPostId }) => {
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const postIdFromRoute = route?.params?.postId;
  const [postId, setPostId] = useState<string>('')
  useEffect(() => {
    const routes = navigation.getState().routes;

    if (defaultPostId && routes.length === 1) {
      setPostId(defaultPostId);
    } else if (postIdFromRoute) {
      setPostId(postIdFromRoute);
    }

    return () => {
      setPostId('');
    }
  }, [])


  return (
    <AmityPostDetailPage
      showEndPopup={route?.params?.showEndPopup}
      isFromComponent={!!defaultPostId && !postIdFromRoute }
      postId={postId}
    />
  );
};

export default PostDetail;
