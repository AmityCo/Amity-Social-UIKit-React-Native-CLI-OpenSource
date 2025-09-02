import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { camera } from '~/v4/assets/icons';
import { useAmityElement } from '~/v4/hook';
import { useStyles } from './styles';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { Typography } from '~/v4/component/Typography/Typography';

type CameraButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function CameraButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.camera_button,
  ...props
}: CameraButtonProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme, styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <TouchableOpacity
      {...props}
      testID={accessibilityId}
      style={[styles.container, props.style]}
    >
      <View style={styles.iconContainer}>
        <SvgXml
          xml={camera()}
          width={24}
          height={24}
          color={theme.colors.base}
        />
      </View>
      <Typography.BodyBold>{config?.text as string}</Typography.BodyBold>
    </TouchableOpacity>
  );
}

export default CameraButton;
