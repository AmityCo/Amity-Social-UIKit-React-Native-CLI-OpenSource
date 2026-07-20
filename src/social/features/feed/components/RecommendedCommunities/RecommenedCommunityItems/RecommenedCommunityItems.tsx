import React from 'react';
import { Image, View } from 'react-native';
import { useStyles } from './styles';
import CommunityJoinedButton from '../../../../../elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButton from '../../../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { SvgXml } from 'react-native-svg';
import { community as communityIcon } from '../../../../../../core/assets/icons';
import CommunityPrivateBadge from '../../../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityOfficialBadge from '../../../../../elements/CommunityOfficialBadge/CommunityOfficialBadge';
import CommunityMemeberCount from '../../../../../elements/CommunityMemeberCount/CommunityMemeberCount';
import CommunityDisplayname from '../../../../../elements/CommunityDisplayname/CommunityDisplayname';
import { getFileUrlWithSize } from '../../../../../utils';

import { ComponentID, PageID } from '../../../../../enums';
import { CommunityCategories } from '../../CommunityCategories/CommunityCategories';
import { useExplore } from '../../../../../providers/ExploreProvider';

type RecommendedCommunityItemProps = {
  pageId?: PageID;
  community: Amity.Community;
  /**
   * Hide the join / joined action button entirely. Used by the Pinned
   * communities section: those memberships are auto-joined and meant to feel
   * permanent, so there is no join or leave affordance on the card.
   */
  hideActionButton?: boolean;
  /**
   * Stretch the card to fill its parent's width instead of the default fixed
   * carousel width. Used when a single card is shown on its own row (e.g. a lone
   * pinned community) so it doesn't leave a large empty gap.
   */
  fullWidth?: boolean;
};

export const RecommendedCommunityItem: React.FC<
  RecommendedCommunityItemProps
> = ({
  community,
  pageId = PageID.WildCardPage,
  hideActionButton = false,
  fullWidth = false,
}) => {
  const componentId = ComponentID.recommended_communities;
  const styles = useStyles();
  const { onJoinRecommendedCommunity, refresh } = useExplore();

  return (
    <View style={[styles.container, fullWidth && styles.containerFullWidth]}>
      {community.avatar?.fileUrl ? (
        <Image
          style={styles.image}
          source={{ uri: getFileUrlWithSize(community.avatar?.fileUrl) }}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <SvgXml xml={communityIcon()} />
        </View>
      )}

      <View style={styles.detailWrap}>
        <View style={styles.displayName}>
          {!community.isPublic && (
            <CommunityPrivateBadge pageId={pageId} componentId={componentId} />
          )}
          <CommunityDisplayname
            communityName={community.displayName}
            pageId={pageId}
            componentId={componentId}
          />

          {community.isOfficial && (
            <CommunityOfficialBadge pageId={pageId} componentId={componentId} />
          )}
        </View>
        <View style={styles.detailBottomWrap}>
          <View style={styles.detailBottomWrapLeft}>
            <CommunityCategories
              categories={community.categories}
              pageId={pageId}
              componentId={componentId}
            />
            <CommunityMemeberCount
              counts={community.membersCount}
              pageId={pageId}
              componentId={componentId}
            />
          </View>
          <View style={styles.detailBottomWrapRight}>
            {hideActionButton ? null : community.isJoined ? (
              <CommunityJoinedButton
                pageId={pageId}
                componentId={componentId}
                communityId={community.communityId}
              />
            ) : (
              <CommunityJoinButton
                pageId={pageId}
                componentId={componentId}
                communityId={community.communityId}
                communityName={community.displayName}
                onJoinSuccess={() => {
                  // Optimistically drop it from the recommended list for instant
                  // feedback, then refresh the whole Explore page so every
                  // section (trending, categories) reflects the true join state.
                  onJoinRecommendedCommunity(community.communityId);
                  refresh();
                }}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
