// Header — group-setting header. Thin wrapper over the shared TopBar (back
// variant) showing the group title, closed by the full-bleed hairline the
// design draws between the header and the page content. TopBar itself carries
// no rule, so the separator is composed here rather than inside the element —
// other TopBar screens are specified without one.

// 1. Internal imports (relative)
import { Divider } from '../../../../../../core/design/atoms/Divider';
import { TopBar } from '../../../../../elements/TopBar';

// 2. Types
type HeaderProps = {
  title: string;
  onBack: () => void;
};

// 3. Named function component
export function Header({ title, onBack }: HeaderProps) {
  return (
    <>
      <TopBar title={title} leadingType="back" onLeading={onBack} />
      <Divider />
    </>
  );
}
