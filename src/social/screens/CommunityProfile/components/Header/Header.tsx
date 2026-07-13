import { memo, useState, FC } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../../enums';
import {
  useAmityComponent,
  useCommunity,
  isModerator,
  useUser,
} from '../../../../hooks';
import { useStyles } from './styles';
import { CommunityCover } from '../../elements/CommunityCover/CommunityCover';
import CommunityPrivateBadge from '../../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityName from '../../../../elements/CommunityName/CommunityName';
import CommunityVerifyBadge from '../../../../elements/CommunityVerifyBadge/CommunityVerifyBadge';
import CommunityDescription from '../../../../elements/CommunityDescription/CommunityDescription';
import CommunityInfo from '../../../../elements/CommunityInfo/CommunityInfo';
import CommunityJoinButtonElement from '../../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import CommunityPendingPost from '../../../../elements/CommunityPendingPost/CommunityPendingPost';
import { usePosts } from '../../../../hooks/usePosts';
import { BUTTON_SIZE } from '../../../../components/Button/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { Client } from '@amityco/ts-sdk-react-native';
import { CommunityCategories } from '../../../../features/feed';

export interface AmityCommunityHeaderRef {
  height: number;
}

type AmityCommunityHeaderComponentProps = {
  pageId?: PageID;
  communityId: string;
  isScrolled?: boolean;
  isScrolling?: boolean;
  onHeightChange?: (height: number) => void;
  isFromComponent?: boolean;
};

const AmityCommunityHeaderComponent: FC<AmityCommunityHeaderComponentProps> = ({
  pageId = PageID.WildCardPage,
  communityId,
  isScrolling = false,
  isScrolled,
  onHeightChange,
  isFromComponent,
}) => {
  const client = Client.getActiveClient();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const componentId = ComponentID.community_header;
  const { community, refresh: refreshCommunity } = useCommunity(communityId);
  const { posts: pendingPosts } = usePosts({
    targetType: 'community',
    targetId: communityId,
    feedType: 'reviewing',
  });
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const currentUser = useUser(client?.userId || '');
  const isCommunityModerator = isModerator(currentUser?.roles);

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
            isFromComponent={isFromComponent}
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
            isFromComponent={isFromComponent}
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
          <CommunityCategories
            pageId={pageId}
            componentId={componentId}
            categories={community.categories}
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
              navigation.navigate('CommunityMembership', {
                community: community,
              });
            }}
          />
          {!community.isJoined && (
            <View style={styles.joinButtonWrap}>
              <CommunityJoinButtonElement
                pageId={pageId}
                componentId={componentId}
                communityId={community.communityId}
                communityName={community.displayName}
                size={BUTTON_SIZE.LARGE}
                // Re-fetch the community so `isJoined` flips and this button
                // switches to the "Joined" state without a manual reload.
                onJoinSuccess={refreshCommunity}
              />
            </View>
          )}
          {(isCommunityModerator ||
            pendingPosts?.some(
              (post) => post.creator?.userId === client.userId
            )) &&
            pendingPosts?.length > 0 &&
            community.isJoined &&
            community?.postSetting === 'ADMIN_REVIEW_POST_REQUIRED' && (
              <CommunityPendingPost
                number={pendingPosts.length}
                pageId={pageId}
                componentId={componentId}
                isModerator={isCommunityModerator}
                style={styles.pendingPostWrap}
                onPress={() => {
                  navigation.navigate('CommunityPendingRequest', {
                    community,
                  });
                }}
              />
            )}
        </View>
      )}
    </>
  );
};

export default memo(AmityCommunityHeaderComponent);
