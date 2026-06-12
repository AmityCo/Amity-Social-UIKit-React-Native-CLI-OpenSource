import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';
import { useAmityElement } from '../../hooks';
import { useStyles } from './styles';
import { Typography } from '../../../core/components/Typography/Typography';
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
}: ChangeThumbnailButtonProps): React.ReactElement => {
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
        {config.text || 'Delete thumbnail'}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
};

export default ChangeThumbnailButton;
