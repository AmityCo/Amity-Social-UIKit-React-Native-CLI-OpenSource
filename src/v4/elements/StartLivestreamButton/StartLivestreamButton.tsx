import React from 'react';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { useAmityElement } from '../../hook';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum';
import { startLivestream } from '../../assets/icons';

type StartLivestreamButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function StartLivestreamButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: StartLivestreamButtonProps) {
  const elementId = ElementID.start_livestream_button;
  const styles = useStyles();
  const { accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      testID={accessibilityId}
      disabled={props.disabled}
      style={[props.disabled && styles.disabled]}
      {...props}
    >
      <SvgXml xml={startLivestream()} />
    </TouchableOpacity>
  );
}

export default StartLivestreamButton;
