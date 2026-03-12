import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { FC, memo, useCallback, useEffect, useState, useRef } from 'react';
import { AmityPostEngagementActionsSubComponentType } from './type';
import {
  PostRepository,
  SubscriptionLevels,
  getPostTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import { useAmityComponent } from '../../../../../hooks';
import { PageID, ComponentID } from '../../../../../enums';
import { SvgXml } from 'react-native-svg';
import { likeReaction } from '../../../../../../core/assets/icons/xml';
import {
  addPostReaction,
  removePostReaction,
} from '../../../../../../core/legacy/feed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import LikeButtonIconElement from '../../../../../elements/LikeButtonIconElement/LikeButtonIconElement';
import CommentButtonIconElement from '../../../../../elements/CommentButtonIconElement/CommentButtonIconElement';
import { useBehaviour } from '../../../../../providers/BehaviourProvider';
import { formatNumber } from '../../../../../../core/utils/number';
import { usePostShareAction } from './usePostShareAction';
import { ShareButton } from '../../../../../elements/ShareButton';

const FeedStyle: FC<AmityPostEngagementActionsSubComponentType> = ({
  community,
  postId,
  pageId,
  componentId,
}) => {
  const { themeStyles } = useAmityComponent({
    pageId: PageID.post_detail_page,
    componentId: ComponentID.post_content,
  });
  const styles = useStyles(themeStyles);
  const { AmityGlobalFeedComponentBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [postData, setPostData] = useState<Amity.Post>(null);
  const [isLike, setIsLike] = useState(false);
  const [totalReactions, setTotalReactions] = useState(0);
  const unsubscribeRef = useRef<() => void>(null);

  const { shareLink, handleSharePress } = usePostShareAction({
    postId,
    postData,
    pageId,
  });

  useEffect(() => {
    PostRepository.getPost(postId, ({ error, loading, data }) => {
      if (!error && !loading) {
        setPostData(data);
        setTotalReactions(data.reactionsCount);
        setIsLike(data.myReactions?.length > 0);
      }
    });
    return () => unsubscribeRef?.current && unsubscribeRef?.current();
  }, [postId]);

  const addReactionToPost = useCallback(async () => {
    unsubscribeRef.current = subscribeTopic(
      getPostTopic(postData, SubscriptionLevels.POST)
    );
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
  }, [isLike, postData, postId]);

  const onPressComment = useCallback(() => {
    if (AmityGlobalFeedComponentBehavior.goToPostDetailPage) {
      return AmityGlobalFeedComponentBehavior.goToPostDetailPage();
    }
    return navigation.navigate('PostDetail', {
      postId: postId,
    });
  }, [AmityGlobalFeedComponentBehavior, navigation, postId]);

  if (community && community.isJoined === false) {
    return (
      <View style={styles.actionSection}>
        <Text style={styles.btnText}>
          Join community to interact with all posts
        </Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPressComment} style={styles.actionSection}>
      <View style={styles.row}>
        <TouchableOpacity onPress={addReactionToPost} style={styles.likeBtn}>
          {isLike ? (
            <SvgXml
              xml={likeReaction(themeStyles.colors.background)}
              width="20"
              height="20"
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
          <Text style={isLike ? styles.likedText : styles.btnText}>
            {formatNumber(totalReactions)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentBtn} onPress={onPressComment}>
          <CommentButtonIconElement
            pageID={pageId}
            componentID={componentId}
            width={20}
            height={20}
            resizeMode="contain"
          />
          <Text style={styles.btnText}>{postData?.commentsCount}</Text>
        </TouchableOpacity>
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
    </Pressable>
  );
};

export default memo(FeedStyle);
