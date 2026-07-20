import React from 'react';
import { Image, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useStyles } from './styles';
import { community as communityIcon } from '../../../../../../core/assets/icons';
import CommunityPrivateBadge from '../../../../../elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityOfficialBadge from '../../../../../elements/CommunityOfficialBadge/CommunityOfficialBadge';
import CommunityMemeberCount from '../../../../../elements/CommunityMemeberCount/CommunityMemeberCount';
import CommunityDisplayname from '../../../../../elements/CommunityDisplayname/CommunityDisplayname';
import { getFileUrlWithSize } from '../../../../../utils';
import { ComponentID, PageID } from '../../../../../enums';
import { CommunityCategories } from '../../CommunityCategories/CommunityCategories';

type PinnedCommunityCardProps = {
  pageId?: PageID;
  community: Amity.Community;
};

export const PinnedCommunityCard: React.FC<PinnedCommunityCardProps> = ({
  community,
  pageId = PageID.WildCardPage,
}) => {
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

        {/* Only render the categories row when the community actually has
            categories — otherwise hide it entirely (no empty gap). */}
        {community.categories?.length > 0 && (
          <View style={styles.categoriesRow}>
            <CommunityCategories
              categories={community.categories}
              pageId={pageId}
              componentId={componentId}
            />
          </View>
        )}

        <CommunityMemeberCount
          counts={community.membersCount}
          pageId={pageId}
          componentId={componentId}
        />
      </View>
    </View>
  );
};
