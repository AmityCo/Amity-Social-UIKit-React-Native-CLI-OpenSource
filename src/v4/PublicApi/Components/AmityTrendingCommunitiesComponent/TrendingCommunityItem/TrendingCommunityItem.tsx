import React, { memo, FC } from 'react';
import { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import CommunityRowImage from '../../../../elements/CommunityRowImage/CommunityRowImage';
import { ComponentID, PageID } from '../../../../enum';
import { View } from 'react-native';
import CommunityJoinedButtonElement from '~/v4/elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButtonElement from '~/v4/elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { CommunityDisplayname } from '~/v4/elements/CommunityDisplayname/CommunityDisplayname';
import CommunityCategory from '~/v4/elements/CommunityCatetory/CommunityCategory';
import CommunityMemeberCount from '~/v4/elements/CommunityMemeberCount/CommunityMemeberCount';

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
  return (
    <View>
      <CommunityRowImage
        pageId={pageId}
        componentId={componentId}
        fileId={community.avatarFileId}
        label={label}
      />
      <View>
        <CommunityDisplayname
          displayName={community.displayName}
          pageId={pageId}
          componentId={componentId}
        />
        <View>
          <View>
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
            <CommunityJoinedButtonElement />
          ) : (
            <CommunityJoinButtonElement />
          )}
        </View>
      </View>
    </View>
  );
};

export default memo(TrendingCommunityItem);
