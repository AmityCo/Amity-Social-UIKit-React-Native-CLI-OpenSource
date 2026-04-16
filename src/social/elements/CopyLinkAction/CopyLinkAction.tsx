import Clipboard from '@react-native-clipboard/clipboard';
import { useBottomSheet } from '../../../core/stores/slices/bottomSheetSlice';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { useAmityElement } from '../../hooks';
import { ComponentID, ElementID, PageID } from '../../enums';
import MenuAction from '../MenuAction/MenuAction';
import { link as linkIcon } from '../../../core/assets/icons';
import { TOAST } from '../../../core/constants';

type Props = {
  link: string;
  pageId: PageID;
  componentId?: ComponentID;
  onPress?: () => void;
  dark?: boolean;
};

export function CopyLinkAction({
  link,
  pageId,
  componentId = ComponentID.WildCardComponent,
  onPress,
  dark,
}: Props) {
  const { showToast } = useToast();
  const { closeBottomSheet } = useBottomSheet();
  const { config, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.copy_link,
  });

  if (isExcluded) return null;

  return (
    <MenuAction
      gap="small"
      dark={dark}
      iconProps={{ xml: linkIcon() }}
      label={config?.text ?? 'Copy link'}
      onPress={() => {
        onPress ? onPress() : closeBottomSheet();
        Clipboard.setString(link);
        showToast({ message: TOAST.SHARE.COPY.SUCCESS, type: 'success' });
      }}
    />
  );
}
