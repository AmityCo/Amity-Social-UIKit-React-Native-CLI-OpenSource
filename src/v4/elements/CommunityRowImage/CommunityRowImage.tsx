import React, { FC, memo, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement, useConfigImageUri, useFile } from '../../hook';
import { Image, View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { community } from '../../assets/icons';

type CommunityRowImageyProps = {
  fileId?: string;
  pageId?: PageID;
  componentId?: ComponentID;
  label: string;
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
      if (uri) {
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
      <LinearGradient
        colors={['transparent', 'black']}
        style={styles.gradientLayer}
      >
        <Typography.BodyBold style={styles.label}>{label}</Typography.BodyBold>
      </LinearGradient>
      {image ? (
        <Image
          source={{ uri: image as string }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <SvgXml xml={community()} width={36} height={22} />
        </View>
      )}
    </View>
  );
};

export default memo(CommunityRowImagey);
