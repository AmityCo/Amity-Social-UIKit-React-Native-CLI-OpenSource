import React, { FC, memo, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement, useConfigImageUri, useFile } from '../../hook';
import { Image, View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { community as communityIcon } from '../../assets/icons';

type CommunityRowImageyProps = {
  fileId?: string;
  pageId?: PageID;
  componentId?: ComponentID;
  label?: string;
};

const CommunityRowImagey: FC<CommunityRowImageyProps> = ({
  fileId,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  label,
}) => {
  // TODO: add state loading and loading skeleton
  const elementId = ElementID.community_row_image;
  const styles = useStyles();
  const [image, setImage] = useState<string | undefined>(undefined);
  const { accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { uri } = useConfigImageUri({
    configPath: {
      page: pageId,
      component: componentId,
      element: elementId,
    },
    configKey: 'image',
  });

  const { getImage } = useFile();

  useEffect(() => {
    const getImageUrl = async () => {
      if (!fileId) return;

      if (!fileId && uri) {
        setImage(uri);
      } else if (fileId) {
        const url = await getImage({ fileId });
        setImage(url);
      }
    };

    getImageUrl();
  }, [uri, fileId, getImage]);

  return (
    <View testID={accessibilityId} style={styles.container}>
      {image ? (
        <Image
          source={{ uri: image as string }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <SvgXml xml={communityIcon()} width={36} height={22} />
        </View>
      )}
      {label && (
        <>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0)', 'transparent']}
            style={styles.gradientLayer}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          />
          <Typography.BodyBold style={styles.label}>
            {label}
          </Typography.BodyBold>
        </>
      )}
    </View>
  );
};

export default memo(CommunityRowImagey);
