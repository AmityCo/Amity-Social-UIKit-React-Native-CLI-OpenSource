import React from 'react';
import { menu } from '../../../core/assets/icons';
import { useAmityElement } from '../../../social/hooks';
import { SvgXml, XmlProps } from 'react-native-svg';
import { ComponentID, ElementID, PageID } from '../../../social/enums';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useStyles } from './styles';

type MenuButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function MenuButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.menu_button,
  iconProps,
  ...props
}: MenuButtonProps) {
  const { themeStyles, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <TouchableOpacity {...props} testID={accessibilityId}>
      <SvgXml
        width="24"
        height="24"
        xml={menu()}
        color={theme.colors.base}
        {...iconProps}
      />
    </TouchableOpacity>
  );
}

export default MenuButton;
