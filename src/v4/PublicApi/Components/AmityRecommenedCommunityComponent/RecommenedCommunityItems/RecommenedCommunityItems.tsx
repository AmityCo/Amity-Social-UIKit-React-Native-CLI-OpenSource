import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import { ComponentID, ImageSizeState, PageID } from '../../../../enum';
import { useFile } from '../../../../hook';
import { useStyles } from './styles';

import CommunityJoinedButton from '../../../../elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButton from '../../../../elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { Typography } from '../../../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import {
  community as communityIcon,
  lock,
  verifiedBadge,
} from '../../../../assets/icons';
import CommunityCategory from '../../../../elements/CommunityCatetory/CommunityCategory';
import CommunityMemeberCount from '../../../../elements/CommunityMemeberCount/CommunityMemeberCount';

type RecommendedCommunityItemProps = {
  pageId?: PageID;
  community: Amity.Community;
};

export const RecommendedCommunityItem: React.FC<
  RecommendedCommunityItemProps
> = ({ community, pageId = PageID.WildCardPage }) => {
  const { getImage } = useFile();
  const componentId = ComponentID.recommended_communities;
  const styles = useStyles();
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchImage = async () => {
      if (!community.avatarFileId) return;

      const url = await getImage({
        fileId: community.avatarFileId,
        imageSize: ImageSizeState.large,
      });

      setImageUrl(url);
    };
    fetchImage();
  }, [community.avatarFileId, getImage]);

  return (
    <View style={styles.container}>
      {community.avatarFileId && imageUrl ? (
        <Image
          style={styles.image}
          source={{ uri: imageUrl }}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <SvgXml xml={communityIcon()} />
        </View>
      )}

      <View style={styles.detailWrap}>
        <View style={styles.communityNameWarp}>
          {!community.isPublic && <SvgXml xml={lock()} />}
          <Typography.BodyBold style={styles.communityName} numberOfLines={1}>
            {community.displayName}
          </Typography.BodyBold>
          {community.isOfficial && <SvgXml xml={verifiedBadge()} />}
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
          {/* TODO: if join community it should be disappeared */}
          {community.isJoined ? (
            <CommunityJoinedButton pageId={pageId} componentId={componentId} />
          ) : (
            <CommunityJoinButton pageId={pageId} componentId={componentId} />
          )}
        </View>
      </View>
    </View>
  );
};
