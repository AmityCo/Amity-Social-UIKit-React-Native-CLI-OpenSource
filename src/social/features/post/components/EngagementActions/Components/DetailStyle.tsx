import { Text, TouchableOpacity, View } from 'react-native';
import { FC, memo, useState, useCallback, useEffect } from 'react';
import {
  PostRepository,
  SubscriptionLevels,
  getPostTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import { AmityPostEngagementActionsSubComponentType } from './type';
import { useStyles } from './styles';
import {
  useAmityComponent,
  useInteractionBehavior,
} from '../../../../../hooks';
import { PageID, ComponentID } from '../../../../../enums';
import { SvgXml } from 'react-native-svg';
import { likeReaction } from '../../../../../../core/assets/icons/xml';
import {
  addPostReaction,
  removePostReaction,
} from '../../../../../../core/legacy/feed';
import LikeButtonIconElement from '../../../../../elements/LikeButtonIconElement/LikeButtonIconElement';
import CommentButtonIconElement from '../../../../../elements/CommentButtonIconElement/CommentButtonIconElement';
import AmityReactionListComponent from '../../../../reaction/components/List';
import { formatNumber } from '../../../../../../core/utils/number';
import { usePostShareAction } from './usePostShareAction';
import { ShareButton } from '../../../../../elements/ShareButton';

const DetailStyle: FC<AmityPostEngagementActionsSubComponentType> = ({
  community,
  postId,
  componentId,
  pageId,
}) => {
  const { themeStyles } = useAmityComponent({
    pageId: PageID.post_detail_page,
    componentId: ComponentID.post_content,
  });
  const styles = useStyles(themeStyles);
  const { handleInteraction } = useInteractionBehavior();
  const [postData, setPostData] = useState<Amity.Post>(null);

  const { shareLink, handleSharePress } = usePostShareAction({
    postId,
    postData,
    pageId,
  });

  const [isLike, setIsLike] = useState(false);
  const [totalReactions, setTotalReactions] = useState(0);
  const [isReactionListVisible, setIsReactionListVisible] = useState(false);
  useEffect(() => {
    if (!postId) return null;
    let unsubscribe: () => void;
    const unsub = PostRepository.getPost(postId, ({ error, loading, data }) => {
      if (!error && !loading) {
        unsubscribe = subscribeTopic(
          getPostTopic(data, SubscriptionLevels.POST)
        );
        setPostData(data);
        setTotalReactions(data.reactionsCount);
        setIsLike(data?.myReactions?.length > 0);
      }
    });
    return () => {
      unsub();
      unsubscribe && unsubscribe();
    };
  }, [postId]);

  const renderLikeText = useCallback(
    (likeNumber: number | undefined): string => {
      if (likeNumber === 1) return 'like';
      return 'likes';
    },
    []
  );
  const renderCommentText = useCallback(
    (commentNumber: number | undefined): string => {
      if (commentNumber === 1) return 'comment';
      return 'comments';
    },
    []
  );

  const addReactionToPost = useCallback(async () => {
    try {
      if (isLike) {
        setIsLike(false);
        setTotalReactions((prev) => prev - 1);
        await removePostReaction(postId, 'like');
      } else {
        setIsLike(true);
        setTotalReactions((prev) => prev + 1);
        await addPostReaction(postId, 'like');
      }
    } catch (error) {
      console.log(error);
    }
  }, [isLike, postId]);

  const onPressReaction = useCallback(() => {
    handleInteraction({
      defaultBehavior: addReactionToPost,
      isJoined: community ? community.isJoined : true,
    });
  }, [addReactionToPost, handleInteraction, community]);

  const onClickReactions = useCallback(() => {
    handleInteraction({
      defaultBehavior: () => setIsReactionListVisible(true),
      allowNonMember: true,
      isJoined: community?.isJoined,
    });
  }, [handleInteraction, community]);

  return (
    <>
      <View style={styles.countSection}>
        {totalReactions ? (
          <View style={styles.row}>
            <SvgXml
              width="20"
              style={{ marginRight: 4 }}
              height="16"
              xml={likeReaction(themeStyles.colors.background)}
            />
            <Text style={styles.likeCountText} onPress={onClickReactions}>
              {formatNumber(totalReactions)} {renderLikeText(totalReactions)}
            </Text>
          </View>
        ) : (
          <Text style={styles.likeCountText} onPress={onClickReactions}>
            {formatNumber(totalReactions)} {renderLikeText(totalReactions)}
          </Text>
        )}
        <Text style={styles.commentCountText}>
          {formatNumber(postData?.localCommentCount)}{' '}
          {renderCommentText(postData?.localCommentCount)}
        </Text>
      </View>
      <View style={[styles.actionSection, styles.detailActionSection]}>
        <View style={styles.row}>
          <TouchableOpacity onPress={onPressReaction} style={styles.likeBtn}>
            {isLike ? (
              <SvgXml
                xml={likeReaction(themeStyles.colors.background)}
                width="20"
                height="16"
              />
            ) : (
              <LikeButtonIconElement
                pageID={pageId}
                componentID={componentId}
                width={20}
                height={20}
                resizeMode="contain"
              />
            )}

            <Text style={isLike ? styles.likedText : styles.btnText}>Like</Text>
          </TouchableOpacity>
          <View style={styles.commentBtn}>
            <CommentButtonIconElement
              pageID={pageId}
              componentID={componentId}
              width={20}
              height={20}
              resizeMode="contain"
            />
            <Text style={styles.btnText}>Comment</Text>
          </View>
        </View>
        {shareLink && (
          <View style={styles.commentBtn}>
            <ShareButton
              pageId={pageId}
              componentId={componentId}
              onPress={handleSharePress}
            />
          </View>
        )}
        {isReactionListVisible && (
          <AmityReactionListComponent
            referenceId={postId}
            referenceType="post"
            isModalVisible={isReactionListVisible}
            onCloseModal={() => setIsReactionListVisible(false)}
          />
        )}
      </View>
    </>
  );
};

export default memo(DetailStyle);
