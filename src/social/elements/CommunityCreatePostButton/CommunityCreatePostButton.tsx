import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { useAmityElement } from '../../hooks';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enums';
import { plus } from '../../../core/assets/icons';

type CommunityCreatePostButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
};

function CommunityCreatePostButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}: CommunityCreatePostButtonProps) {
  const elementId = ElementID.community_create_post_button;
  const { themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <TouchableOpacity
      hitSlop={0.8}
      style={styles.fab}
      activeOpacity={0.8}
      {...props}
    >
      <SvgXml
        xml={plus()}
        width={32}
        height={32}
        color={themeStyles.colors.background}
      />
    </TouchableOpacity>
  );
}

export default CommunityCreatePostButton;
