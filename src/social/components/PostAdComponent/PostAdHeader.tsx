import React, { FC, memo } from 'react';
import { View, Text } from 'react-native';

import { useStyles } from './styles';
import AvatarElement from '../../legacy/Elements/CommonElements/AvatarElement';
import { useAmityComponent } from '../../hooks';
import { PageID, ComponentID, ElementID } from '../../enums';
import { star } from '../../../core/assets/icons/xml';
import { SvgXml } from 'react-native-svg';
import { defaultAdAvatarUri } from '../../../core/assets';

type PostAdHeaderType = {
  advertiser?: Amity.Ad['advertiser'];
  pageId?: PageID;
};

const PostAdHeader: FC<PostAdHeaderType> = ({ advertiser, pageId }) => {
  const componentId = ComponentID.post_content;
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId: pageId,
    componentId,
  });
  const styles = useStyles(themeStyles);

  if (!advertiser) return null;

  return (
    <View testID={accessibilityId} style={styles.header}>
      <AvatarElement
        style={styles.avatar}
        avatarId={advertiser?.avatarFileId}
        pageID={pageId}
        elementID={ElementID.WildCardElement}
        componentID={componentId}
        defaultAvatar={defaultAdAvatarUri}
      />
      <View style={styles.headerRightSection}>
        <Text numberOfLines={1} style={styles.headerText}>
          {advertiser?.name}
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
    </View>
  );
};

export default memo(PostAdHeader);
