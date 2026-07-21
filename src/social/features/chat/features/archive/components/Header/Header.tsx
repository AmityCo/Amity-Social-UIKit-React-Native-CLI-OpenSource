// Header — ported from AmityUiKitWeb
// v4/chat/features/archive/components/Header/Header.
// The archived-chats top bar: a back button + the "Archived chats" title.

// 1. Internal imports (relative)
import { TopBar } from '../../../../elements/TopBar';
import { useString } from '../../../../../../../core/localization';

// 2. Types
type HeaderProps = {
  onBack: () => void;
};

// 3. Named function component
export function Header({ onBack }: HeaderProps) {
  const title = useString('amity_chat_archived_navbar_title');
  return <TopBar title={title} leadingType="back" onLeading={onBack} />;
}
