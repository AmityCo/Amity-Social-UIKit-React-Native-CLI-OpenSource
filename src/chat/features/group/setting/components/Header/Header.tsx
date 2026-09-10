// Header — group-setting header, ported from AmityUiKitWeb
// v4/chat/features/group/setting/components/Header. Thin wrapper over the shared
// TopBar (back variant) showing the group title.

// 1. Internal imports (relative)
import { TopBar } from '../../../../../elements/TopBar';

// 2. Types
type HeaderProps = {
  title: string;
  onBack: () => void;
};

// 3. Named function component
export function Header({ title, onBack }: HeaderProps) {
  return <TopBar title={title} leadingType="back" onLeading={onBack} />;
}
