import { useEffect, useState } from 'react';
import AmityPostDetailPage from '../../features/post/Detail';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type PostDetailPageProps = {
  defaultPostId?: string;
};

function PostDetail({ defaultPostId }: PostDetailPageProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const postIdFromRoute = route?.params?.postId;
  const [postId, setPostId] = useState<string>('');
  useEffect(() => {
    const routes = navigation.getState().routes;

    if (defaultPostId && routes.length === 1) {
      setPostId(defaultPostId);
    } else if (postIdFromRoute) {
      setPostId(postIdFromRoute);
    }

    return () => {
      setPostId('');
    };
  }, [defaultPostId, navigation, postIdFromRoute]);

  return (
    <AmityPostDetailPage
      showEndPopup={route?.params?.showEndPopup}
      isFromComponent={!!defaultPostId && !postIdFromRoute}
      postId={postId}
      category={route?.params?.category}
      isDeleted={route?.params?.isDeleted}
    />
  );
}

export default PostDetail;
