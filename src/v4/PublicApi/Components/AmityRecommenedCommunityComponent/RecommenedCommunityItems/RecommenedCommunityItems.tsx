import React, { useCallback, useEffect } from 'react';
import { Image, View } from 'react-native';
import { CategoryChips } from '../../../../component/CategoryChips/CategoryChips';
import { ImageSizeState } from '../../../../enum';
import { useFile } from '../../../../hook';
import { useStyles } from './styles';

import CommunityJoinedButtonElement from '../../../../PublicApi/Elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButtonElement from '../../../../PublicApi/Elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { Typography } from '../../../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import {
  community as communityIcon,
  lock,
  verifiedBadge,
} from '../../../../assets/icons';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

type RecommendedCommunityItemProps = {
  community: Amity.Community;
};

export const RecommendedCommunityItem: React.FC<
  RecommendedCommunityItemProps
> = ({ community }) => {
  const { getImage } = useFile();
  const styles = useStyles();
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);

  const onJoinCommunity = useCallback(() => {
    CommunityRepository.joinCommunity(community.communityId);
  }, [community.communityId]);

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
          <View>
            <CategoryChips categoryIds={community.categoryIds} />
            <Typography.Caption style={styles.memberText}>
              {community.membersCount} member
              {community.membersCount > 1 ? 's' : ''}
            </Typography.Caption>
          </View>
          {/* TODO: if join community it should be disappeared */}
          {community.isJoined ? (
            <CommunityJoinedButtonElement />
          ) : (
            <CommunityJoinButtonElement onPress={() => onJoinCommunity()} />
          )}
        </View>
      </View>
    </View>
  );
};
