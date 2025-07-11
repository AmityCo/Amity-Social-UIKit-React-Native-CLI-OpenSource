import React from 'react';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { plus } from '../../assets/icons';
import { useAmityElement } from '../../hook';
import { ComponentID, ElementID, PageID } from '../../enum';
import { Typography } from '../../component/Typography/Typography';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

type AddOptionButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function AddOptionButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: AddOptionButtonProps) {
  const elementId = ElementID.poll_add_option_button;
  const { accessibilityId, themeStyles, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  return (
    <TouchableOpacity
      testID={accessibilityId}
      style={styles.addOptionButton}
      {...props}
    >
      <SvgXml xml={plus(themeStyles.colors.base)} width="20" height="20" />
      <Typography.BodyBold style={styles.addOptionLabel}>
        {config?.text as string}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
}

export default AddOptionButton;
