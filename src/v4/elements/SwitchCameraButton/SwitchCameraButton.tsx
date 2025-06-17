import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useAmityElement } from '../../hook';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum';
import { rotate } from '../../assets/icons';

type SwitchCameraButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function SwitchCameraButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: SwitchCameraButtonProps) {
  const elementId = ElementID.switch_camera_button;
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  return (
    <TouchableOpacity testID={accessibilityId} activeOpacity={0.7} {...props}>
      <SvgXml
        width={30}
        height={30}
        xml={rotate()}
        color={themeStyles.colors.background}
      />
    </TouchableOpacity>
  );
}

export default SwitchCameraButton;
