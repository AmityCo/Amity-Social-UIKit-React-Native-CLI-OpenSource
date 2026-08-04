// AddMemberButton — ported from AmityUiKitWeb
// v4/chat/features/group/add-member/components/AddMemberButton. A full-width
// primary submit button pinned to the bottom of the add-member screen. Web's
// `Button.Main` (filled/primary/lg) → the RN Button atom (primary/lg, fullWidth);
// the web form `type="submit"` becomes an explicit `onSubmit` press handler.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Button } from '../../../../../../core/design/atoms/Button';
import { useString } from '../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type AddMemberButtonProps = {
  isDisabled: boolean;
  onSubmit: () => void;
};

// 4. Named function component
export function AddMemberButton({
  isDisabled,
  onSubmit,
}: AddMemberButtonProps) {
  const { styles } = useStyles();
  const buttonLabel = useString('amity_chat_add_member_button');
  return (
    <View style={styles.container}>
      <Button
        hierarchy="primary"
        size="lg"
        fullWidth
        label={buttonLabel}
        disabled={isDisabled}
        onPress={onSubmit}
      />
    </View>
  );
}
