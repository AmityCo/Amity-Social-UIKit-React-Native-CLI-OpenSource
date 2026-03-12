import { Share } from 'react-native';
import { useBottomSheet } from '../../../core/stores/slices/bottomSheetSlice';
import { useAmityElement } from '../../hooks';
import { ComponentID, ElementID, PageID } from '../../enums';
import MenuAction from '../MenuAction/MenuAction';
import { share } from '../../../core/assets/icons';

type Props = {
  link: string;
  pageId: PageID;
  componentId?: ComponentID;
  onPress?: () => void;
  dark?: boolean;
};

export function ShareAction({
  link,
  pageId,
  componentId = ComponentID.WildCardComponent,
  onPress,
  dark,
}: Props) {
  const { closeBottomSheet } = useBottomSheet();
  const { config, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.share_link,
  });

  if (isExcluded) return null;

  return (
    <MenuAction
      gap="small"
      dark={dark}
      iconProps={{ xml: share() }}
      label={config?.text ?? 'Share to'}
      onPress={() => {
        onPress ? onPress() : closeBottomSheet();
        Share.share({ url: link, message: link });
      }}
    />
  );
}
