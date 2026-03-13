import React from 'react';
import { Image, View } from 'react-native';
import { ComponentID, PageID } from '../../../../enum';
import { useStyles } from './styles';

import CommunityJoinedButton from '../../../../elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButton from '../../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { SvgXml } from 'react-native-svg';
import { community as communityIcon } from '../../../../assets/icons';
import CommunityPrivateBadge from '../../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityOfficialBadge from '../../../../elements/CommunityOfficialBadge/CommunityOfficialBadge';
import CommunityCategory from '../../../../elements/CommunityCatetory/CommunityCategory';
import CommunityMemeberCount from '../../../../elements/CommunityMemeberCount/CommunityMemeberCount';
import CommunityDisplayname from '../../../../elements/CommunityDisplayname/CommunityDisplayname';
import { getFileUrlWithSize } from '../../../../utils';

type RecommendedCommunityItemProps = {
  pageId?: PageID;
  community: Amity.Community;
};

export const RecommendedCommunityItem: React.FC<
  RecommendedCommunityItemProps
> = ({ community, pageId = PageID.WildCardPage }) => {
  const componentId = ComponentID.recommended_communities;
  const styles = useStyles();

  return (
    <View style={styles.container}>
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
            <CommunityCategory
              categoryIds={community.categoryIds}
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
            {community.isJoined ? (
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
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
