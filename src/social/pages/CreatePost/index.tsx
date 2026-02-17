import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { FC } from 'react';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import AmityPostComposerPage from '../../legacy/Pages/AmityPostComposerPage/AmityPostComposerPage';
import { AmityPostComposerMode } from '../../legacy/types';

type ICreatePost = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

const CreatePost: FC<ICreatePost> = ({ route }) => {
  const { community, targetId, targetType } = route.params;
  return (
    <AmityPostComposerPage
      mode={AmityPostComposerMode.CREATE}
      targetId={targetId}
      targetType={targetType}
      community={community}
    />
  );
};

export default CreatePost;
