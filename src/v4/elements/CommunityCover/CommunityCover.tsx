import React, { FC, useCallback } from 'react';
import { PageID, ComponentID, ElementID } from '../../enum';
import { useAmityElement } from '../../hook';
import LinearGradient from 'react-native-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import CommunityCoverNavigator from './CommunityCoverNavigator';
import useAuth from '../../../hooks/useAuth';

type CommunityCoverProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  community: Amity.Community;
  smallHeader?: boolean;
  hideButtons?: boolean;
};

const CommunityCover: FC<CommunityCoverProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  community,
  smallHeader = false,
  hideButtons = false,
}) => {
  const { apiRegion } = useAuth();
  const elementId = ElementID.community_cover;
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    smallContainer: {
      height: 100,
    },
    placehoder: {
      width: '100%',
      height: 187.5,
    },
    coverImage: {
      width: '100%',
      height: 187.5,
    },
  });

  const renderImage = useCallback(() => {
    if (community.avatarFileId) {
      return (
        <Image
          source={{
            uri: `https://api.${apiRegion}.amity.co/api/v3/files/${community.avatarFileId}/download?size=medium`,
          }}
          style={[styles.coverImage, smallHeader ? styles.smallContainer : {}]}
          blurRadius={smallHeader ? 10 : 0}
        />
      );
    } else {
      return (
        <LinearGradient
          colors={[
            themeStyles.colors.baseShade3,
            themeStyles.colors.baseShade2,
          ]}
          style={[styles.placehoder, smallHeader ? styles.smallContainer : {}]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      );
    }
  }, [community.avatarFileId, smallHeader, styles, themeStyles, apiRegion]);

  return (
    <View testID={accessibilityId}>
      {renderImage()}
      {!hideButtons && (
        <CommunityCoverNavigator
          pageId={pageId}
          componentId={componentId}
          communityId={community.communityId}
        />
      )}
    </View>
  );
};

export default CommunityCover;
