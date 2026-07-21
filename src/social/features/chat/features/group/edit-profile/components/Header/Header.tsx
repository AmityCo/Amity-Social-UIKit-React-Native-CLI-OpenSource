// Header — edit-group-profile header, ported from AmityUiKitWeb
// v4/chat/features/group/edit-profile/components/Header. Shared TopBar (back) with
// a trailing "Save" button.
//
// RN adaptations from web:
//   - There is no `<form>`; the web submit button (`type="submit"`) becomes a
//     Button whose `onPress` calls the passed `onSave`.
//   - Web `Button.Main styleType="ghost" hierarchy="primary"` → the RN Button atom
//     with `hierarchy="tertiary"` (the ghost/primary text variant).

// 1. Internal imports (relative)
import { Button } from '../../../../../../../../core/design/atoms/Button';
import { useString } from '../../../../../../../../core/localization';
import { TopBar } from '../../../../../elements/TopBar';

// 2. Types
type HeaderProps = {
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
};

// 3. Named function component
export function Header({ isFormValid, onClose, onSave }: HeaderProps) {
  const title = useString('amity_chat_edit_group_profile_navbar_title');
  const saveLabel = useString('amity_chat_group_edit_profile_save');

  return (
    <TopBar
      title={title}
      leadingType="back"
      onLeading={onClose}
      trailing={
        <Button
          hierarchy="tertiary"
          tone="default"
          size="sm"
          label={saveLabel}
          disabled={!isFormValid}
          onPress={onSave}
        />
      }
    />
  );
}
