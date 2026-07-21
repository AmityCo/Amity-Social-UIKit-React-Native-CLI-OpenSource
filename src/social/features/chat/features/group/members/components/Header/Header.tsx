// Header — ported from AmityUiKitWeb
// v4/chat/features/group/members/components/Header.
//
// The member-list top bar: back + centered title, plus a trailing "add member"
// button shown only to moderators. Web's `Button.Icon` (Plus) → the RN Button
// atom rendered icon-only (icon `plus-r`), fed into the chat TopBar's trailing
// slot.

// 1. React / RN imports

// 2. Internal imports
import { TopBar } from '../../../../../elements/TopBar';
import { Button } from '../../../../../../../../core/design/atoms/Button';
import { useString } from '../../../../../../../../core/localization';

// 3. Types
type HeaderProps = {
  isViewerModerator: boolean;
  onBack: () => void;
  onAddMember: () => void;
};

// 4. Named function component
export function Header({
  isViewerModerator,
  onBack,
  onAddMember,
}: HeaderProps) {
  const title = useString('amity_chat_member_list_title');
  return (
    <TopBar
      title={title}
      leadingType="back"
      onLeading={onBack}
      trailing={
        isViewerModerator ? (
          // Borderless icon-only add button — same transparent style as the
          // SelectedMember close (cross) control, per QA (#9). Was a filled
          // secondary Button (blue surface + border).
          <Button.Icon
            icon="plus-r"
            styleType="transparent"
            hierarchy="primary"
            size={24}
            onPress={onAddMember}
            accessibilityLabel={title}
          />
        ) : undefined
      }
    />
  );
}
