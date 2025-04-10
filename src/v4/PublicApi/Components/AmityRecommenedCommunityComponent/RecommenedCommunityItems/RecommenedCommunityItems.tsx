import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { CategoryChips } from '../../../../component/CategoryChips/CategoryChips';
import { ImageSizeState } from '../../../../enum';
import { useFile } from '../../../../hook';
import { useStyles } from './styles';

import CommunityJoinedButtonElement from '../../../../PublicApi/Elements/CommunityJoinedButtonElement/CommunityJoinedButtonElement';
import CommunityJoinButtonElement from '../../../../PublicApi/Elements/CommunityJoinButtonElement/CommunityJoinButtonElement';
import { Typography } from '../../../../component/Typography/Typography';

type RecommendedCommunityItemProps = {
  community: Amity.Community;
};

export const RecommendedCommunityItem: React.FC<
  RecommendedCommunityItemProps
> = ({ community }) => {
  const { getImage } = useFile();
  const styles = useStyles();
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    // TODO: fix default image
    const fetchImage = async () => {
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
      <Image
        style={styles.image}
        source={{ uri: imageUrl }}
        resizeMode="cover"
      />
      <View style={styles.detailWrap}>
        <View style={styles.communityNameWarp}>
          {!community.isPublic && <Text>Private</Text>}
          <Typography.BodyBold style={styles.communityName}>
            {community.displayName}{' '}
          </Typography.BodyBold>
          {community.isOfficial && <Text>Official</Text>}
        </View>
        <View style={styles.detailBottomWrap}>
          <View>
            <CategoryChips categoryIds={community.categoryIds} />
            <Typography.Caption style={styles.memberText}>
              {community.membersCount} member
              {community.membersCount > 1 ? 's' : ''}
            </Typography.Caption>
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
