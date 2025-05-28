import React, { memo, useState, FC } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
import {
  useAmityComponent,
  useCommunity,
  useIsCommunityModerator,
} from '../../../hook';
import { useStyles } from './styles';
import CommunityCover from '../../../elements/CommunityCover/CommunityCover';
import CommunityPrivateBadge from '../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityName from '../../../elements/CommunityName/CommunityName';
import CommunityVerifyBadge from '../../../elements/CommunityVerifyBadge/CommunityVerifyBadge';
import CommunityCategory from '../../../elements/CommunityCatetory/CommunityCategory';
import CommunityDescription from '../../../elements/CommunityDescription/CommunityDescription';
import CommunityInfo from '../../../elements/CommunityInfo/CommunityInfo';
import CommunityJoinButtonElement from '../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import CommunityPendingPost from '../../../elements/CommunityPendingPost/CommunityPendingPost';
import { usePosts } from '../../../hook/usePosts';
import AmityStoryTabComponent from '../AmityStoryTabComponent/AmityStoryTabComponent';
import { AmityStoryTabComponentEnum } from '../../types';
import { BUTTON_SIZE } from '../../../component/Button/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { Client } from '@amityco/ts-sdk-react-native';

export interface AmityCommunityHeaderRef {
  height: number;
}

type AmityCommunityHeaderComponentProps = {
  pageId?: PageID;
  communityId: string;
  isScrolled?: boolean;
  isScrolling?: boolean;
  onHeightChange?: (height: number) => void;
};

const AmityCommunityHeaderComponent: FC<AmityCommunityHeaderComponentProps> = ({
  pageId = PageID.WildCardPage,
  communityId,
  isScrolling = false,
  isScrolled,
  onHeightChange,
}) => {
  const client = Client.getActiveClient();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const componentId = ComponentID.community_header;
  const { community } = useCommunity(communityId);
  const { posts: pendingPosts } = usePosts({
    targetType: 'community',
    targetId: communityId,
  });
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const { isCommunityModerator } = useIsCommunityModerator({
    communityId: community?.communityId,
    userId: client?.userId,
  });

  const styles = useStyles(themeStyles);

  const [headerHeight, setHeaderHeight] = useState(0);
  // Use a single approach for updating height
  const updateHeaderHeight = (newHeight: number) => {
    if (newHeight > 0 && newHeight !== headerHeight) {
      setHeaderHeight(newHeight);

      // Call the callback to notify parent
      if (onHeightChange) {
        onHeightChange(newHeight);
      }
    }
  };

  if (!community) return null;

  return (
    <>
      {isScrolled ? (
        <View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            updateHeaderHeight(height);
          }}
        >
          <CommunityCover
            pageId={pageId}
            componentId={componentId}
            community={community}
            smallHeader={true}
            hideButtons={!isScrolled && isScrolling}
          />
        </View>
      ) : (
        <View
          testID={accessibilityId}
          accessibilityLabel={accessibilityId}
          style={styles.container}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            updateHeaderHeight(height);
          }}
        >
          <CommunityCover
            pageId={pageId}
            componentId={componentId}
            community={community}
            smallHeader={false}
            hideButtons={isScrolling}
          />
          <View style={styles.communityNameWrap}>
            {!community.isPublic && (
              <CommunityPrivateBadge
                pageId={pageId}
                componentId={componentId}
              />
            )}
            <CommunityName
              pageId={pageId}
              componentId={componentId}
              communityName={community.displayName}
            />
            {community.isOfficial && (
              <CommunityVerifyBadge pageId={pageId} componentId={componentId} />
            )}
          </View>
          <CommunityCategory
            pageId={pageId}
            componentId={componentId}
            categoryIds={community.categoryIds}
            allVisible={true}
            style={styles.categoryWrap}
          />
          <CommunityDescription
            pageId={pageId}
            componentId={componentId}
            description={community.description}
            style={styles.descriptionWrap}
          />
          <CommunityInfo
            pageId={pageId}
            componentId={componentId}
            community={community}
            style={styles.infoWrap}
            onPress={() => {
              navigation.navigate('CommunityMemberDetail', {
                communityId: community.communityId,
              });
            }}
          />
          {!community.isJoined && (
            <View style={styles.joinButtonWrap}>
              <CommunityJoinButtonElement
                pageId={pageId}
                componentId={componentId}
                communityId={community.communityId}
                size={BUTTON_SIZE.LARGE}
              />
            </View>
          )}
          {isCommunityModerator && pendingPosts?.length > 0 && (
            <CommunityPendingPost
              number={pendingPosts.length}
              pageId={pageId}
              componentId={componentId}
              style={styles.pendingPostWrap}
              onPress={() => {
                navigation.navigate('PendingPosts', {
                  communityId: community.communityId,
                  isModerator: !!isCommunityModerator,
                });
              }}
            />
          )}
          <AmityStoryTabComponent
            type={AmityStoryTabComponentEnum.communityFeed}
            targetId={communityId}
          />
        </View>
      )}
    </>
  );
};

export default memo(AmityCommunityHeaderComponent);
