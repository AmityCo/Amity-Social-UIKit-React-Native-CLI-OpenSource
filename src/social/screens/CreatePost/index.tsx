import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import AmityPostComposerPage from '../../features/post/Composer';
import { AmityPostComposerMode } from '../../types';

type CreatePostProps = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

function CreatePost({ route }: CreatePostProps) {
  const { community, targetId, targetType } = route.params;
  return (
    <AmityPostComposerPage
      mode={AmityPostComposerMode.CREATE}
      targetId={targetId}
      targetType={targetType}
      community={community}
    />
  );
}

export default CreatePost;
