import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';
import { useAmityElement } from '../../../social/hooks';
import { useStyles } from './styles';
import { Typography } from '../../component/Typography/Typography';
import { trash } from '../../../core/assets/icons';
import { SvgXml } from 'react-native-svg';

type ChangeThumbnailButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

const ChangeThumbnailButton = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: ChangeThumbnailButtonProps): React.JSX.Element => {
  const { themeStyles, config } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.delete_thumbnail_button,
  });

  const styles = useStyles(themeStyles);

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.button} {...props}>
      <SvgXml
        width={24}
        height={24}
        xml={trash()}
        color={themeStyles.colors.alert}
      />
      <Typography.BodyBold style={styles.label}>
        {(config.text as string) || 'Delete thumbnail'}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
};

export default ChangeThumbnailButton;
