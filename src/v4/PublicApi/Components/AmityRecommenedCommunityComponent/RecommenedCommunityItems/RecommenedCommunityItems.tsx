import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { CategoryChips } from '../../../../component/CategoryChips/CategoryChips';
import { ElementID, ImageSizeState } from '../../../../enum';
import { useFile } from '../../../../hook';
import { useStyles } from './styles';

import ButtonWithIconElement from '../../../../PublicApi/Elements/ButtonWithIconElement/ButtonWithIconElement';

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
          <Text>{community.displayName} </Text>
          {community.isOfficial && <Text>Official</Text>}
        </View>
        <View>
          <View>
            <CategoryChips categoryIds={community.categoryIds} />
            <Text style={styles.memberText}>
              {community.membersCount} member
              {community.membersCount > 1 ? 's' : ''}
            </Text>
          </View>
          {/* TODO: add new component (primary button) Join button & Joined button */}
          {community.isJoined ? (
            <ButtonWithIconElement
              elementId={ElementID.community_joined_button}
            />
          ) : (
            <ButtonWithIconElement
              elementId={ElementID.community_join_button}
            />
          )}
        </View>
      </View>
    </View>
  );
};
