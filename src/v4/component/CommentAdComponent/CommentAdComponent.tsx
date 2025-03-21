import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from './styles';
import { useAmityComponent } from '../../hook';
import { star } from '../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';
import AvatarElement from '../../PublicApi/Elements/CommonElements/AvatarElement';
import AdInformation from '../AdInformation/AdInformation';
import { infoIcon } from '../../../svg/svg-xml-list';
import { defaultAdAvatarUri } from '../../assets';
import bottomSheetSlice from '../../../redux/slices/bottomSheetSlice';
import { useDispatch } from 'react-redux';
import AssetDownloader from '../../engine/AssetDownloader';
import AdEngine from '../../engine/AdEngine';
import { Linking } from 'react-native';

type CommnetAdComponentType = {
  pageId?: PageID;
  ad?: Amity.Ad;
};

const CommentAdComponent: FC<CommnetAdComponentType> = ({
  ad,
  pageId = PageID.WildCardPage,
}) => {
  const dispatch = useDispatch();
  const componentId = ComponentID.WildCardComponent;

  const { openBottomSheet } = bottomSheetSlice.actions;
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId: pageId,
    componentId,
  });

  const styles = useStyles(themeStyles);

  if (!ad) return null;

  return (
    <View style={styles.container} testID={accessibilityId}>
      <AvatarElement
        style={styles.avatar}
        avatarId={ad?.advertiser?.avatarFileId}
        pageID={pageId}
        elementID={ElementID.WildCardElement}
        componentID={componentId}
        defaultAvatar={defaultAdAvatarUri}
      />
      <View style={styles.bubble}>
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
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.headerText}>
            {ad?.advertiser?.name}
          </Text>
          <View style={styles.adBadge}>
            <SvgXml
              style={styles.adBadgeIcon}
              xml={star()}
              width="12"
              height="12"
            />
            <Text style={styles.adBadgeContent}>Sponsored</Text>
          </View>
        </View>
        {ad.body && <Text style={styles.textContent}>{ad.body}</Text>}
        <View style={styles.callToActionCard}>
          {ad?.image1_1?.fileUrl && (
            <Image
              source={{
                uri: AssetDownloader.instance.getFilePath(
                  ad?.image1_1?.fileUrl + '?size=large'
                ),
              }}
              style={styles.callToActionCardImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.callToActionCardRightSection}>
            <Text numberOfLines={1} style={styles.callToActionCardDescription}>
              {ad?.description}
            </Text>
            <Text numberOfLines={2} style={styles.callToActionCardHeadline}>
              {ad?.headline}
            </Text>

            {ad?.callToActionUrl && (
              <TouchableOpacity
                style={styles.callToActionButton}
                onPress={() => {
                  AdEngine.instance.markClicked(
                    ad,
                    'comment' as Amity.AdPlacement
                  );
                  Linking.openURL(ad?.callToActionUrl);
                }}
              >
                <Text style={styles.callToActionText}>{ad.callToAction}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(CommentAdComponent);
