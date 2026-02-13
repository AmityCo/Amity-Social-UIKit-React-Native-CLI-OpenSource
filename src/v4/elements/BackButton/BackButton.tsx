import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import { arrowLeft } from '../../../core/assets/icons';
import { useAmityElement } from '../../../social/hooks';
import { ComponentID, ElementID, PageID } from '../../enums';
import { useStyles } from './styles';

type BackButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function BackButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.back_button,
  iconProps,
  ...props
}: BackButtonProps) {
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
        xml={arrowLeft()}
        color={theme.colors.base}
        {...iconProps}
      />
    </TouchableOpacity>
  );
}

export default BackButton;
