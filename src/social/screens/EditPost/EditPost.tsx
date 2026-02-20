import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import AmityPostComposerPage from '../../features/post/Composer';
import { AmityPostComposerMode } from '../../types';

type EditPostProps = NativeStackScreenProps<RootStackParamList, 'EditPost'>;

function EditPost({ route }: EditPostProps) {
  const { community, post } = route.params;
  return (
    <AmityPostComposerPage
      mode={AmityPostComposerMode.EDIT}
      post={post}
      community={community}
    />
  );
}

export default EditPost;
