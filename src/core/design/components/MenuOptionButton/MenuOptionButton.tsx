// MenuOptionButton — ported from AmityUiKitWeb core/design/components/MenuOptionButton.
// A single full-width row: leading icon + bold label, with a danger variant that
// tints both the icon and the text with the alert token. Web rendered a Button +
// Typography.BodyBold; RN uses Pressable + the Typography component.

import { Pressable } from 'react-native';
import { AmityIcon, type AmityIconName } from '../../icons';
import { Typography } from '../Typography';
import { useStyles } from './styles';

export type MenuOptionButtonProps = {
  text: string;
  icon?: AmityIconName;
  onPress: () => void;
  isDanger?: boolean;
};

export function MenuOptionButton({
  text,
  icon,
  onPress,
  isDanger = false,
}: MenuOptionButtonProps) {
  const { styles, colorToken } = useStyles({ isDanger });

  return (
    <Pressable style={styles.menuOptionButton} onPress={onPress}>
      {icon ? (
        <AmityIcon name={icon} size={24} tokenColor={colorToken} />
      ) : null}
      <Typography variant="bodyBold" style={styles.text}>
        {text}
      </Typography>
    </Pressable>
  );
}
