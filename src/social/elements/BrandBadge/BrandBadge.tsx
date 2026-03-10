import { SvgXml, XmlProps } from 'react-native-svg';
import { brand } from '../../../core/assets/icons';

type BrandBadgeProps = Pick<
  XmlProps,
  'width' | 'height' | 'accessibilityLabel' | 'accessible'
>;

export function BrandBadge(props: BrandBadgeProps) {
  return <SvgXml width="24" height="24" xml={brand()} {...props} />;
}
