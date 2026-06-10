import { FC, memo, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ImageStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { arrowForward } from '../../../../../core/assets/icons/xml';
import { useStyles } from './styles';
import { getCommunityById } from '../../../../../core/legacy/community';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';
import { IMentionPosition } from '../../../../../core/types';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { ComponentID, ElementID, PageID } from '../../../../enums';
import AvatarElement from '../../../../elements/CommonElements/AvatarElement';
import ModeratorBadgeElement from '../../../../elements/ModeratorBadgeElement/ModeratorBadgeElement';
import { BrandBadge } from '../../../../elements/BrandBadge';
import AmityPostEngagementActionsComponent from '../EngagementActions';

import { useAmityComponent, useUser, isModerator } from '../../../../hooks';

import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '../../../../enums/AmityPostContentComponentStyle';
import TimestampElement from '../../../../elements/TimestampElement/TimestampElement';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import PostContent from '../../../../components/PostContent';
import { PostMenu } from '../../../../components/PostMenu';
import PinBadge from '../../../../elements/PinBadge';
import AnnouncementBadge from '../../../../elements/AnnouncementBadge';
import { Typography } from '../../../../../core/components/Typography/Typography';

type AmityPostContentComponentProps = {
  post: Amity.Post;
  pageId?: PageID;
  AmityPostContentComponentStyle?: AmityPostContentComponentStyleEnum;
  isCommunityNameShown?: boolean;
  showedAllOptions?: boolean;
  category?: AmityPostCategory;
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
  showedAllOptions,
  AmityPostContentComponentStyle = AmityPostContentComponentStyleEnum.detail,
  isCommunityNameShown = true,
  category = AmityPostCategory.GENERAL,
}) => {
  const theme = useTheme() as MyMD3Theme;
  const {
    AmityPostContentComponentBehavior,
    AmityGlobalFeedComponentBehavior,
    AmityCommunityProfilePageBehavior,
    AmityUserFeedComponentBehavior,
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

  const creatorUser = useUser(creator?.userId || '');
  const isCommunityModerator = isModerator(creatorUser?.roles);

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

  const onPressPost = () => {
    if (AmityGlobalFeedComponentBehavior.goToPostDetailPage) {
      return AmityGlobalFeedComponentBehavior.goToPostDetailPage(postId);
    }
    if (AmityCommunityProfilePageBehavior.goToPostDetailPage) {
      return AmityCommunityProfilePageBehavior.goToPostDetailPage(postId);
    }
    if (AmityUserFeedComponentBehavior?.goToPostDetailPage) {
      return AmityUserFeedComponentBehavior.goToPostDetailPage(postId);
    }
    return navigation.navigate('PostDetail', {
      postId: postId,
      category: category,
    });
  };

  return (
    <View>
      {(category === AmityPostCategory.ANNOUNCEMENT ||
        category === AmityPostCategory.PIN_AND_ANNOUNCEMENT) && (
        <View style={styles.featuredBadgeContainer}>
          <AnnouncementBadge componentId={ComponentID.post_content} />
        </View>
      )}
      <View
        key={postId}
        style={styles.postWrap}
        testID={accessibilityId}
        accessibilityLabel={accessibilityId}
      >
        <Pressable style={styles.headerSection} onPress={onPressPost}>
          <View style={styles.user}>
            {creator?.userId ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDisplayNamePress();
                }}
              >
                <AvatarElement
                  style={styles.avatar as ImageStyle}
                  avatarId={creator?.avatarFileId}
                  pageID={pageId}
                  elementID={ElementID.WildCardElement}
                  componentID={componentId}
                  avatarCustomUrl={creator?.avatarCustomUrl}
                  targetType="user"
                  displayName={creator?.displayName}
                />
              </TouchableOpacity>
            ) : (
              <AvatarElement
                style={styles.avatar as ImageStyle}
                avatarId={creator?.avatarFileId}
                pageID={pageId}
                elementID={ElementID.WildCardElement}
                componentID={componentId}
                avatarCustomUrl={creator?.avatarCustomUrl}
                targetType="user"
                displayName={creator?.displayName}
              />
            )}

            <View style={styles.fillSpace}>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={
                    targetType === 'community' &&
                    isCommunityNameShown &&
                    !!communityData?.displayName
                      ? styles.headerTextContainer // global feed: cap at 40% to leave room for community name
                      : styles.headerTextContainerUser // community feed: fill available width
                  }
                  onPress={handleDisplayNamePress}
                >
                  <Typography.BodyBold
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.headerText}
                  >
                    {creator?.displayName}
                  </Typography.BodyBold>
                </TouchableOpacity>
                {creator?.isBrand && (
                  <BrandBadge
                    width={20}
                    height={20}
                    accessible={true}
                    accessibilityLabel="Brand verified"
                  />
                )}
                {communityData?.displayName && isCommunityNameShown && (
                  <View style={styles.communityNameContainer}>
                    <SvgXml
                      style={styles.arrow}
                      xml={arrowForward(theme.colors.baseShade1)}
                      width="8"
                      height="8"
                    />
                    <TouchableOpacity
                      onPress={handleCommunityNamePress}
                      style={styles.fillSpace}
                    >
                      <Typography.BodyBold
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        style={styles.headerText}
                      >
                        {communityData?.displayName}
                      </Typography.BodyBold>
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
          {(category === AmityPostCategory.PIN ||
            category === AmityPostCategory.PIN_AND_ANNOUNCEMENT) && (
            <PinBadge componentId={ComponentID.post_content} />
          )}
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
              showedAllOptions={showedAllOptions}
              mentionPositionArr={mentionPositionArr}
              disabledPoll={communityData?.isPublic && !communityData?.isJoined}
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
    </View>
  );
};

export default memo(AmityPostContentComponent);
