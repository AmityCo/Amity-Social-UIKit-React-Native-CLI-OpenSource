import React from 'react';
import { SvgXml, XmlProps } from 'react-native-svg';
import { featured } from '~/v4/assets/icons';
import { useAmityElement } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { useStyles } from './styles';

type AnnouncementBadgeProps = {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function AnnouncementBadge({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.announcement_badge,
  iconProps,
}: AnnouncementBadgeProps) {
  const { themeStyles, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <SvgXml
      width={73}
      height={26}
      testID={accessibilityId}
      xml={featured({
        color: theme.colors.secondary,
        backgroundColor: theme.colors.secondaryShade4,
      })}
      {...iconProps}
    />
  );
}

export default AnnouncementBadge;
