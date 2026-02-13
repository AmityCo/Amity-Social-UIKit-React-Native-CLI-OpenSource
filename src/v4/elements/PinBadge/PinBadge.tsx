import React from 'react';
import { SvgXml, XmlProps } from 'react-native-svg';
import { pinFill } from '../../../core/assets/icons';
import { useAmityElement } from '../../../social/hooks';
import { ComponentID, ElementID, PageID } from '../../enums';
import { useStyles } from './styles';

type PinBadgeProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function PinBadge({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.pin_badge,
  iconProps,
}: PinBadgeProps) {
  const { themeStyles, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <SvgXml
      width={30}
      height={30}
      xml={pinFill()}
      testID={accessibilityId}
      color={theme.colors.primary}
      {...iconProps}
    />
  );
}

export default PinBadge;
