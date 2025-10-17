import React from 'react';
import { useStyles } from './styles';
import AmityPostEngagementActionsComponent from '../AmityPostEngagementActionsComponent/AmityPostEngagementActionsComponent';
import { PostTargetType } from '../../../../enum/postTargetType';
import { AmityPostContentComponentStyleEnum } from '../../../../v4/enum/AmityPostContentComponentStyle';
import { ComponentID, PageID } from '../../../../v4/enum';
import CommentList from '../../../component/Social/CommentList/CommentList';
import { SafeAreaView } from 'react-native-safe-area-context';

type AmityPostEngagementContentComponentProps = {
  postId: string;
  targetId: string;
  targetType: PostTargetType;
  postType?: Amity.CommentReferenceType;
};

function AmityPostEngagementContentComponent({
  postId,
  targetId,
  targetType,
  postType = 'post',
}: AmityPostEngagementContentComponentProps) {
  const { styles } = useStyles();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AmityPostEngagementActionsComponent
        postId={postId}
        targetId={targetId}
        targetType={targetType}
        pageId={PageID.post_detail_page}
        componentId={ComponentID.post_content}
        AmityPostContentComponentStyle={
          AmityPostContentComponentStyleEnum.detail
        }
      />
      <CommentList postId={postId} postType={postType} withAvatar />
    </SafeAreaView>
  );
}

export default AmityPostEngagementContentComponent;
