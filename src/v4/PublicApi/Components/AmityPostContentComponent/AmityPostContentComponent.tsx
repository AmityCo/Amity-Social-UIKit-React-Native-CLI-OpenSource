import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { arrowForward } from '../../../../svg/svg-xml-list';
import { useStyles } from './styles';
import { getCommunityById } from '../../../../providers/Social/communities-sdk';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import { IMentionPosition } from '../../../types/type';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { ComponentID, ElementID, PageID } from '../../../enum';
import AvatarElement from '../../Elements/CommonElements/AvatarElement';
import { useAmityComponent, useIsCommunityModerator } from '../../../hook';
import ModeratorBadgeElement from '../../Elements/ModeratorBadgeElement/ModeratorBadgeElement';
import AmityPostEngagementActionsComponent from '../AmityPostEngagementActionsComponent/AmityPostEngagementActionsComponent';
import { AmityPostContentComponentStyleEnum } from '../../../enum/AmityPostContentComponentStyle';
import TimestampElement from '../../Elements/TimestampElement/TimestampElement';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import PostContent from '../../../../v4/component/PostContent';
import { PostMenu } from '../../../component/PostMenu';

type AmityPostContentComponentProps = {
  post: Amity.Post;
  pageId?: PageID;
  AmityPostContentComponentStyle?: AmityPostContentComponentStyleEnum;
  isCommunityNameShown?: boolean;
};
export interface MediaUri {
  uri: string;
}
export interface IVideoPost {
  thumbnailFileId: string;
  videoFileId: {
    original: string;
  };
}
const AmityPostContentComponent: FC<AmityPostContentComponentProps> = ({
  pageId = PageID.WildCardPage,
  post,
  AmityPostContentComponentStyle = AmityPostContentComponentStyleEnum.detail,
  isCommunityNameShown = true,
}) => {
  const theme = useTheme() as MyMD3Theme;
  const {
    AmityPostContentComponentBehavior,
    AmityGlobalFeedComponentBehavior,
  } = useBehaviour();
  const componentId = ComponentID.post_content;
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId: pageId,
    componentId: componentId,
  });
  const styles = useStyles(themeStyles);
  const [textPost, setTextPost] = useState<string>('');
  const [communityData, setCommunityData] = useState<Amity.Community>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mentionPositionArr, setMentionsPositionArr] = useState<
    IMentionPosition[]
  >([]);

  const {
    postId,
    data,
    myReactions = [],
    reactions: reactionCount,
    createdAt,
    creator,
    targetType,
    targetId,
    children = [],
    editedAt,
    metadata,
  } = post ?? {};
  const mentionPosition = metadata?.mentioned;

  const { isCommunityModerator } = useIsCommunityModerator({
    communityId: targetType === 'community' && targetId,
    userId: creator?.userId,
  });

  useEffect(() => {
    if (mentionPosition) {
      setMentionsPositionArr(mentionPosition);
    }
  }, [mentionPosition]);

  useEffect(() => {
    setTextPost((data as Amity.ContentDataText)?.text);
    if (targetType === 'community' && targetId) {
      getCommunityInfo(targetId);
    }
  }, [data, myReactions, reactionCount?.like, targetId, targetType]);

  async function getCommunityInfo(id: string) {
    const { data: community }: { data: Amity.LiveObject<Amity.Community> } =
      await getCommunityById(id);
    if (community.error) return;
    if (!community.loading) {
      setCommunityData(community?.data);
    }
  }

  const handleDisplayNamePress = () => {
    if (!creator?.userId) return null;
    if (AmityPostContentComponentBehavior?.goToUserProfilePage) {
      return AmityPostContentComponentBehavior.goToUserProfilePage({
        userId: creator.userId,
      });
    }
    return navigation.navigate('UserProfile', {
      userId: creator.userId,
    });
  };

  const handleCommunityNamePress = () => {
    if (targetType !== 'community' || !targetId) return null;
    if (AmityPostContentComponentBehavior?.goToCommunityProfilePage) {
      return AmityPostContentComponentBehavior.goToCommunityProfilePage({
        communityId: targetId,
        communityName: communityData?.displayName,
      });
    }
    return navigation.navigate('CommunityProfilePage', {
      communityId: targetId,
    });
  };

  const onPressPost = useCallback(() => {
    if (AmityGlobalFeedComponentBehavior.goToPostDetailPage) {
      return AmityGlobalFeedComponentBehavior.goToPostDetailPage(postId);
    }
    return navigation.navigate('PostDetail', {
      postId: postId,
    });
  }, [AmityGlobalFeedComponentBehavior, navigation, postId]);

  return (
    <View
      key={postId}
      style={styles.postWrap}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <Pressable style={styles.headerSection} onPress={onPressPost}>
        <View style={styles.user}>
          <AvatarElement
            style={styles.avatar}
            avatarId={creator?.avatarFileId}
            pageID={pageId}
            elementID={ElementID.WildCardElement}
            componentID={componentId}
          />

          <View style={styles.fillSpace}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={
                  targetType === 'community' ? styles.headerTextContainer : {}
                }
                onPress={handleDisplayNamePress}
              >
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={styles.headerText}
                >
                  {creator?.displayName}
                </Text>
              </TouchableOpacity>

              {communityData?.displayName && isCommunityNameShown && (
                <View style={styles.communityNameContainer}>
                  <SvgXml
                    style={styles.arrow}
                    xml={arrowForward(theme.colors.baseShade1)}
                    width="8"
                    height="8"
                  />

                  <TouchableOpacity onPress={handleCommunityNamePress}>
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={3}
                      style={styles.headerText}
                    >
                      {communityData?.displayName}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.timeRow}>
              {isCommunityModerator && (
                <View style={styles.row}>
                  <ModeratorBadgeElement
                    pageID={pageId}
                    componentID={componentId}
                    communityId={targetType === 'community' && targetId}
                    userId={creator?.userId}
                  />
                  <Text style={styles.dot}>·</Text>
                </View>
              )}
              <TimestampElement
                createdAt={createdAt}
                style={styles.headerTextTime}
                componentID={componentId}
              />

              {editedAt !== createdAt && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.headerTextTime}>Edited</Text>
                </>
              )}
            </View>
          </View>
        </View>
        {AmityPostContentComponentStyle ===
          AmityPostContentComponentStyleEnum.feed && (
          <PostMenu post={post} pageId={pageId} componentId={componentId} />
        )}
      </Pressable>
      <View>
        <View style={styles.bodySection}>
          <PostContent
            post={post}
            textPost={textPost}
            childrenPosts={children}
            onPressPost={onPressPost}
            mentionPositionArr={mentionPositionArr}
          />
        </View>
        <AmityPostEngagementActionsComponent
          pageId={pageId}
          componentId={componentId}
          AmityPostContentComponentStyle={AmityPostContentComponentStyle}
          targetType={targetType}
          targetId={targetId}
          postId={postId}
        />
      </View>
    </View>
  );
};

export default memo(AmityPostContentComponent);
