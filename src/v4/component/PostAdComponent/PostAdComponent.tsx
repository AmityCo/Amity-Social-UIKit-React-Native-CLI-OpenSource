import React, { FC, memo, useEffect, useState } from 'react';
import { Image, View, TouchableOpacity, Linking } from 'react-native';

import { ComponentID, PageID } from '../../enum';
import { useStyles } from './styles';
import PostAdHeader from './PostAdHeader';
import { useAmityComponent, useFile } from '../../hook';
import { Text } from 'react-native-paper';
import { infoIcon } from '../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';
import AdInformation from '../AdInformation/AdInformation';
import bottomSheetSlice from '../../../redux/slices/bottomSheetSlice';
import { useDispatch } from 'react-redux';

type PostAdComponentType = {
  pageId?: PageID;
  ad?: Amity.Ad;
};

const PostAdComponent: FC<PostAdComponentType> = ({
  ad,
  pageId = PageID.WildCardPage,
}) => {
  const componentId = ComponentID.post_content;
  const dispatch = useDispatch();

  const [image, setImage] = useState<string | null>(null);

  const { openBottomSheet } = bottomSheetSlice.actions;
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId: pageId,
    componentId: componentId,
  });

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
      <TouchableOpacity
        style={styles.infoIcon}
        onPress={() => {
          ad?.advertiser?.companyName &&
            dispatch(
              openBottomSheet({
                content: (
                  <AdInformation
                    pageId={pageId}
                    companyName={ad.advertiser.companyName}
                  />
                ),
                height: 400,
              })
            );
        }}
      >
        <SvgXml xml={infoIcon()} width="16" height="16" />
      </TouchableOpacity>
      <PostAdHeader advertiser={ad?.advertiser} pageId={pageId} />
      {ad.body && <Text style={styles.textContent}>{ad.body}</Text>}
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.footer}>
        <View style={styles.footerTextWrap}>
          <Text numberOfLines={1} style={styles.footerDescription}>
            {ad?.description}
          </Text>
          <Text numberOfLines={2} style={styles.footerHeadline}>
            {ad?.headline}
          </Text>
        </View>
        {ad?.callToActionUrl && (
          <TouchableOpacity
            style={styles.callToActionButton}
            onPress={() => Linking.openURL(ad?.callToActionUrl)}
          >
            <Text style={styles.callToActionText}>{ad.callToAction}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default memo(PostAdComponent);
