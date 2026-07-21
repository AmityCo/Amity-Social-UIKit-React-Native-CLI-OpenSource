// ScrollToLatestButton — ported from AmityUiKitWeb features/shared/components/
// ScrollToLatestButton. A circular filled-secondary icon button pinned to the
// bottom-right of the message list that scrolls to the latest message.
//
// Web uses the `Button.Icon` (IconButton) atom with styleType="filled" /
// hierarchy="secondary" / size={40}; RN uses the ported Button.Icon atom. The
// bottom-right pin (web .scrollToLatestButton) is passed as a positioning-only
// style. box-shadow dropped (RN, no hex allowed).

// 1. Internal imports
import { Button } from '../../../../../../../core/design/atoms/Button';
import { useStyles } from './styles';

// 2. Types
type ScrollToLatestButtonProps = {
  onPress: () => void;
};

// 3. Named function component
export function ScrollToLatestButton({ onPress }: ScrollToLatestButtonProps) {
  const { styles } = useStyles();

  return (
    <Button.Icon
      icon="chevron-down"
      styleType="filled"
      hierarchy="secondary"
      size={40}
      style={styles.button}
      onPress={onPress}
      accessibilityLabel="Scroll to latest message"
    />
  );
}
