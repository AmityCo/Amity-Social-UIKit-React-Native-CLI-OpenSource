import React from 'react';
import { View, ViewProps } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import { moderator } from '~/v4/assets/icons';
import { useAmityElement } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { useStyles } from './styles';

type ModeratorBadgeProps = ViewProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function ModeratorBadge({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.moderator_badge,
  iconProps,
  style,
  ...props
}: ModeratorBadgeProps) {
  const { themeStyles, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme, styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <View {...props} style={[styles.container, style]} testID={accessibilityId}>
      <SvgXml
        width="12"
        height="12"
        xml={moderator()}
        color={theme.colors.primary}
        {...iconProps}
      />
    </View>
  );
}

export default ModeratorBadge;
