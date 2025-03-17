import React, { FC, memo } from 'react';
import { View } from 'react-native';

import { useStyles } from './styles';
import AvatarElement from '../../PublicApi/Elements/CommonElements/AvatarElement';
import { useAmityComponent } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';
import { Text } from 'react-native-paper';
import { star } from '../../../svg/svg-xml-list';
import { SvgXml } from 'react-native-svg';

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
    <View testID={accessibilityId} style={styles.headerSection}>
      <AvatarElement
        style={styles.avatar}
        avatarId={advertiser?.avatarFileId}
        pageID={pageId}
        elementID={ElementID.WildCardElement}
        componentID={componentId}
      />
      <View style={styles.headerRightSection}>
        <Text style={styles.headerText}>{advertiser?.name}</Text>
        <View style={styles.adBadge}>
          <SvgXml xml={star()} width="32" height="32" />
          <Text style={styles.adBadgeContent}>Sponsored</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(PostAdHeader);
