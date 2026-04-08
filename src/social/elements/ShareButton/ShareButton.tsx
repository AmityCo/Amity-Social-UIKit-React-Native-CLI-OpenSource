import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ComponentID, ElementID, PageID } from '../../enums';
import { useAmityElement } from '../../hooks';
import { share } from '../../../core/assets/icons';

type Props = {
  pageId: PageID;
  componentId?: ComponentID;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ShareButton({
  pageId,
  componentId = ComponentID.WildCardComponent,
  onPress,
  style,
}: Props) {
  const { themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.share_button,
  });

  if (isExcluded) return null;

  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <SvgXml
        width={20}
        height={20}
        xml={share()}
        color={themeStyles.colors.baseShade2}
      />
    </TouchableOpacity>
  );
}
