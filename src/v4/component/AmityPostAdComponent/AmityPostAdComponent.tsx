import React, { FC, memo, useEffect, useState, useRef } from 'react';
import { Image, View, TouchableOpacity, Linking } from 'react-native';

import { ComponentID, PageID } from '../../enum';
import { useStyles } from './styles';
import PostAdHeader from './PostAdHeader';
import { useAmityComponent, useFile } from '../../hook';
import { Text } from 'react-native-paper';
import { infoIcon } from '../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';

type AmityPostAdComponentType = {
  pageId?: PageID;
  ad?: Amity.Ad;
};

const AmityPostAdComponent: FC<AmityPostAdComponentType> = ({ ad, pageId }) => {
  const componentId = ComponentID.post_content;
  const [image, setImage] = useState<string | null>(null);
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId: pageId,
    componentId: componentId,
  });

  const sheetRef = useRef<BottomSheetMethods>(null);

  const { getImage } = useFile();

  const styles = useStyles(themeStyles);

  useEffect(() => {
    const fetchImage = async (fileId: string) => {
      const result = await getImage({ fileId });
      setImage(result);
    };

    if (!ad?.image1_1?.fileId) return;
    fetchImage(ad?.image1_1.fileId);
  }, [ad?.image1_1?.fileId, getImage]);

  if (!ad) return null;

  return (
    <View style={styles.container} testID={accessibilityId}>
      <SvgXml
        style={styles.infoIcon}
        xml={infoIcon()}
        width="16"
        height="16"
        onPress={() => {
          console.log('open sheet');
          sheetRef.current.open();
        }}
      />
      <PostAdHeader advertiser={ad?.advertiser} pageId={pageId} />
      <Text style={styles.textContent}>{ad.body}</Text>
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.footer}>
        <View style={styles.footerTextWrap}>
          <Text style={styles.footerDescription}>{ad?.description}</Text>
          <Text style={styles.footerHeadline}>{ad?.headline}</Text>
        </View>
        <TouchableOpacity
          style={styles.callToActionButton}
          onPress={() => Linking.openURL(ad?.callToActionUrl)}
        >
          <Text style={styles.callToActionText}>{ad.callToAction}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(AmityPostAdComponent);
