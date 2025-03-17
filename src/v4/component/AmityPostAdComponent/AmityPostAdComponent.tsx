import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { infoIcon } from '../../../svg/svg-xml-list';
import { ComponentID, PageID } from '../../enum';
import { useStyles } from './styles';
import PostAdHeader from './PostAdHeader';
import { useAmityComponent } from '../../hook';

type AmityPostAdComponentType = {
  pageId?: PageID;
  ad?: Amity.Ad;
};

const AmityPostAdComponent: FC<AmityPostAdComponentType> = ({ ad, pageId }) => {
  const componentId = ComponentID.post_content;
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId: pageId,
    componentId: componentId,
  });
  const styles = useStyles(themeStyles);

  if (!ad) return null;

  return (
    <View style={styles.container} testID={accessibilityId}>
      <SvgXml xml={infoIcon()} width="16" height="16" />
      <PostAdHeader advertiser={ad?.advertiser} pageId={pageId} />
    </View>
  );
};

export default memo(AmityPostAdComponent);
