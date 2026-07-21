// Header — ported from AmityUiKitWeb
// v4/chat/features/group/banned-members/components/Header. A back + title top bar.

// 2. Internal imports
import { TopBar } from '../../../../../elements/TopBar';
import { useString } from '../../../../../../../../core/localization';

// 3. Types
type HeaderProps = {
  onBack: () => void;
};

// 4. Named function component
export function Header({ onBack }: HeaderProps) {
  const title = useString('amity_chat_banned_member_list_navbar_title');
  return <TopBar title={title} leadingType="back" onLeading={onBack} />;
}
