import React from 'react';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { useAmityElement } from '../../hook';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum';
import { plus } from '../../../v4/assets/icons';

type CommunityCreatePostButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function CommunityCreatePostButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: CommunityCreatePostButtonProps) {
  const elementId = ElementID.community_create_post_button;
  const { themeStyles } = useAmityElement({ pageId, componentId, elementId });
  const styles = useStyles(themeStyles);

  return (
    <TouchableOpacity
      hitSlop={0.8}
      style={styles.fab}
      activeOpacity={0.8}
      {...props}
    >
      <SvgXml
        xml={plus()}
        width={32}
        height={32}
        color={themeStyles.colors.background}
      />
    </TouchableOpacity>
  );
}

export default CommunityCreatePostButton;
