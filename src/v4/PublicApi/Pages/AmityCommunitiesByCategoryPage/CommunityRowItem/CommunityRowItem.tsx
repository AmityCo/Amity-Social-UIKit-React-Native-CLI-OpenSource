import { View } from 'react-native';
import React, { FC, memo } from 'react';
import { useStyles } from './styles';
import { ComponentID, PageID } from '../../../../enum';
import CommunityRowImage from '../../../../elements/CommunityRowImage/CommunityRowImage';
import { CommunityDisplayname } from '../../../../elements/CommunityDisplayname/CommunityDisplayname';
import CommunityCategory from '../../../../elements/CommunityCatetory/CommunityCategory';
import CommunityMemeberCount from '../../../../elements/CommunityMemeberCount/CommunityMemeberCount';

type CommunityRowItemProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  community: Amity.Community;
};

const CommunityRowItem: FC<CommunityRowItemProps> = ({
  community,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <CommunityRowImage
        pageId={pageId}
        componentId={componentId}
        fileId={community.avatarFileId}
      />
      <View style={styles.detailWrap}>
        <CommunityDisplayname
          community={community}
          pageId={pageId}
          componentId={componentId}
        />
        <View style={styles.detailBottomWrap}>
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
      </View>
    </View>
  );
};

export default memo(CommunityRowItem);
