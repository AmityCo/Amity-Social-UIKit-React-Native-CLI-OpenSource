import React, { memo, FC } from 'react';
import { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import CommunityRowImage from '../../../../elements/CommunityRowImage/CommunityRowImage';
import { ComponentID, PageID } from '../../../../enum';
import { View } from 'react-native';
import CommunityJoinedButtonElement from '../../../../elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButtonElement from '../../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { CommunityDisplayname } from '../../../../elements/CommunityDisplayname/CommunityDisplayname';
import CommunityCategory from '../../../../elements/CommunityCatetory/CommunityCategory';
import CommunityMemeberCount from '../../../../elements/CommunityMemeberCount/CommunityMemeberCount';
import { useStyles } from './styles';

type TrendingCommunityItemProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  themeStyles?: MyMD3Theme;
  community: Amity.Community;
  label: string;
};

const TrendingCommunityItem: FC<TrendingCommunityItemProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.trending_communities,
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
        <CommunityDisplayname
          displayName={community.displayName}
          pageId={pageId}
          componentId={componentId}
        />
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
          {community.isJoined ? (
            <CommunityJoinedButtonElement
              pageId={pageId}
              componentId={componentId}
            />
          ) : (
            <CommunityJoinButtonElement
              pageId={pageId}
              componentId={componentId}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default memo(TrendingCommunityItem);
