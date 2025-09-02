import React from 'react';
import { View, ViewProps } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useStyles } from './styles';

type CommunityPrivacyIconProps = ViewProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: XmlProps;
};

function CommunityPrivacyIcon({
  iconProps,
  pageId = PageID.WildCardPage,
  elementId = ElementID.close_button,
  componentId = ComponentID.WildCardComponent,
  ...props
}: CommunityPrivacyIconProps) {
  const { themeStyles, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme, styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <View
      {...props}
      testID={accessibilityId}
      style={[styles.container, props.style]}
    >
      <SvgXml width={20} height={20} color={theme.colors.base} {...iconProps} />
    </View>
  );
}

export default CommunityPrivacyIcon;
