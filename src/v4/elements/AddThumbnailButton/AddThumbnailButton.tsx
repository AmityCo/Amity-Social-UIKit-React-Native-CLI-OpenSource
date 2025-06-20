import React from 'react';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { useAmityElement } from '../../hook';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum';
import { thumbnail } from '../../assets/icons';
import { Typography } from '../../component/Typography/Typography';

type AddThumbnailButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function AddThumbnailButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: AddThumbnailButtonProps) {
  const elementId = ElementID.add_thumbnail_button;
  const { accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.button}
      testID={accessibilityId}
      {...props}
    >
      <SvgXml
        width={30}
        height={30}
        xml={thumbnail()}
        color={themeStyles.colors.background}
      />
      <Typography.CaptionBold style={styles.label}>
        Add thumbnail
      </Typography.CaptionBold>
    </TouchableOpacity>
  );
}

export default AddThumbnailButton;
