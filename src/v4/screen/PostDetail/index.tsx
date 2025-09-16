import React from 'react';
import AmityPostDetailPage from '../../PublicApi/Pages/AmityPostDetailPage/AmityPostDetailPage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../routes/RouteParamList';

type IPostDetailPage = {
  defaultPostId?: string;
};

const PostDetail: React.FC<IPostDetailPage> = ({ defaultPostId }) => {
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const postIdFromRoute = route?.params?.postId;

  return (
    <AmityPostDetailPage
      showEndPopup={route?.params?.showEndPopup}
      isFromComponent={!!defaultPostId}
      postId={defaultPostId || postIdFromRoute}
      category={route?.params?.category}
    />
  );
};

export default PostDetail;
