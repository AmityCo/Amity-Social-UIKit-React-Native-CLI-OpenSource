import React from 'react';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { close } from '../../assets/icons';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

type CancelCreateLivestreamButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function CancelCreateLivestreamButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: CancelCreateLivestreamButtonProps) {
  const elementId = ElementID.cancel_create_livestream_button;
  const styles = useStyles();
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.button}
      testID={accessibilityId}
      {...props}
    >
      <SvgXml
        width={24}
        height={24}
        xml={close()}
        color={themeStyles.colors.background}
      />
    </TouchableOpacity>
  );
}

export default CancelCreateLivestreamButton;
