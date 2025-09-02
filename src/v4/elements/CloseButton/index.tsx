import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import { close } from '../../assets/icons';
import { useAmityElement } from '../../../v4/hook';
import { ComponentID, ElementID, PageID } from '../../../v4/enum';
import { useStyles } from './styles';

type CloseButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function CloseButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.close_button,
  iconProps,
  ...props
}: CloseButtonProps) {
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
        xml={close()}
        width="24"
        height="24"
        color={theme.colors.base}
        {...iconProps}
      />
    </TouchableOpacity>
  );
}

export default CloseButton;
