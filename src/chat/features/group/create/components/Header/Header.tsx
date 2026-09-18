// Header — create-group header. Ported from AmityUiKitWeb
// v4/chat/features/group/create/components/Header. The shared TopBar (close) with
// a trailing "Create" button.
//
// RN adaptations from web:
//   - Leading control is a close (X), per the design's New group top nav; web
//     used a back chevron. The select-member step navigates here with `replace`,
//     so closing (after the leave confirmation) exits the whole flow.
//   - RN has no `<form>`, so web's `Button.Main type="submit"` becomes a `Button`
//     (tertiary/sm — the RN analogue of web ghost/primary) wired to `onCreate`.

// 1. React / RN imports (none beyond the shared units)

// 2. Internal imports (relative)
import { TopBar } from '../../../../../elements/TopBar';
import { Button } from '../../../../../../core/design/atoms/Button';
import { useString } from '../../../../../../core/localization';

// 3. Types
type HeaderProps = {
  isFormValid: boolean;
  onClose: () => void;
  onCreate: () => void;
};

// 4. Named function component
export function Header({ isFormValid, onClose, onCreate }: HeaderProps) {
  const title = useString('amity_chat_create_group_title');
  const createLabel = useString('amity_chat_create_group_button');

  return (
    <TopBar
      title={title}
      leadingType="close"
      onLeading={onClose}
      trailing={
        <Button
          hierarchy="tertiary"
          size="sm"
          label={createLabel}
          disabled={!isFormValid}
          onPress={onCreate}
        />
      }
    />
  );
}
