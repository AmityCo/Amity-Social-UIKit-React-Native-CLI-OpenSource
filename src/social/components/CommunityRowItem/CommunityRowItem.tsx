import React, { memo, FC } from 'react';
import { MyMD3Theme } from '~/core/providers/AmityUIKitProvider';
import CommunityRowImage from '../../../v4/elements/CommunityRowImage/CommunityRowImage';
import { ComponentID, PageID } from '../../enums';
import { View } from 'react-native';
import CommunityJoinedButtonElement from '../../../v4/elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButtonElement from '../../../v4/elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import CommunityDisplayname from '../../../v4/elements/CommunityDisplayname/CommunityDisplayname';
import CommunityCategory from '../../../v4/elements/CommunityCatetory/CommunityCategory';
import CommunityMemeberCount from '../../../v4/elements/CommunityMemeberCount/CommunityMemeberCount';
import { useStyles } from './styles';
import CommunityPrivateBadge from '../../../v4/elements/CommunityPrivateBadge/CommunityPrivateBadge';
import CommunityOfficialBadge from '../../../v4/elements/CommunityOfficialBadge/CommunityOfficialBadge';

type CommunityRowItemProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  themeStyles?: MyMD3Theme;
  community: Amity.Community;
  showJoinButton?: boolean;
  label?: string;
};

const CommunityRowItem: FC<CommunityRowItemProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.trending_communities,
  showJoinButton = true,
  community,
  label,
}) => {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <CommunityRowImage
        pageId={pageId}
        componentId={componentId}
        fileId={community.avatarFileId}
        label={label}
      />
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
            {showJoinButton &&
              (community.isJoined ? (
                <CommunityJoinedButtonElement
                  pageId={pageId}
                  componentId={componentId}
                  communityId={community.communityId}
                />
              ) : (
                <CommunityJoinButtonElement
                  pageId={pageId}
                  componentId={componentId}
                  communityId={community.communityId}
                />
              ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(CommunityRowItem);
