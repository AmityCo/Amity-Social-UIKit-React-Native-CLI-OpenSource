import { SvgXml } from 'react-native-svg';
import { plus } from '../../../core/assets/icons';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Typography } from '../../../core/components/Typography/Typography';
import { useStyles } from './styles';
import { ComponentID, ElementID, PageID } from '../../enums';
import { useAmityElement } from '../../hooks';

type CommunityAddMemberButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function CommunityAddMemberButton({
  style,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.community_add_member_button,
  ...props
}: CommunityAddMemberButtonProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <TouchableOpacity
      {...props}
      testID={accessibilityId}
      style={[styles.addButton, style]}
    >
      <View style={styles.addButtonIconContainer}>
        <SvgXml
          width={24}
          height={24}
          xml={plus()}
          color={themeStyles.colors.base}
        />
      </View>
      <Typography.Caption style={styles.addButtonLabel}>
        {config?.text}
      </Typography.Caption>
    </TouchableOpacity>
  );
}

export default CommunityAddMemberButton;
