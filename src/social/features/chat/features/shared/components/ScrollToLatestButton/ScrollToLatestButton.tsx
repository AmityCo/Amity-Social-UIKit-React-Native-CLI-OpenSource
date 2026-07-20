// ScrollToLatestButton — ported from AmityUiKitWeb features/shared/components/
// ScrollToLatestButton. A circular filled-secondary icon button pinned to the
// bottom-right of the message list that scrolls to the latest message.
//
// Web used the `Button.Icon` (IconButton) atom with styleType="filled" /
// hierarchy="secondary" / size={40}. That IconButton atom is NOT ported to RN
// (the RN `Button` atom is the *Main* button, a different shape), so the button
// is inlined here with a Pressable + AmityIcon using the IconButton/Filled/
// Secondary design tokens. box-shadow dropped (RN, no hex allowed).

// 1. React / RN imports
import { Pressable } from 'react-native';

// 2. Internal imports
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
type ScrollToLatestButtonProps = {
  onPress: () => void;
};

// 4. Named function component
export function ScrollToLatestButton({ onPress }: ScrollToLatestButtonProps) {
  const { styles } = useStyles();

  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
    >
      <AmityIcon
        name="chevron-down"
        size={24}
        tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
      />
    </Pressable>
  );
}
