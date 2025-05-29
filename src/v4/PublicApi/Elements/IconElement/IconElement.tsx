import { Image } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import React, { memo, useEffect, useState } from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import RNFS from 'react-native-fs';

type IconElementProps = {
  defaultIcon?: string;
  configIcon?: string;
  configIconStyle?: StyleProp<ImageStyle>;
  defaultIconStyle?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function IconElement({
  configIcon,
  defaultIcon,
  defaultIconStyle,
  configIconStyle,
}: IconElementProps) {
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const checkImage = async () => {
      try {
        if (configIcon) {
          const imagePath = `../../../configAssets/icons/${configIcon}.png`;
          const exists = await RNFS.exists(imagePath);
          if (exists) setImageUri(imagePath);
        }
      } catch (error) {
        setImageUri(null);
      }
    };

    checkImage();
  }, [configIcon]);

  console.log(imageUri);

  if (imageUri) {
    return <Image source={imageUri} style={configIconStyle} />;
  }

  return <SvgXml xml={defaultIcon} {...defaultIconStyle} />;
}

export default memo(IconElement);
