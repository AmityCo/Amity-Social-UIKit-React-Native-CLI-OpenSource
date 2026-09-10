import { Button as ButtonBase } from './Button';
import { Icon } from './Icon';

// Compound: `Button.Icon` mirrors web core/design/atoms/Button/Icon.
export const Button = Object.assign(ButtonBase, { Icon });

export type {
  ButtonProps,
  ButtonHierarchy,
  ButtonTone,
  ButtonSize,
} from './Button';
export type {
  IconButtonProps,
  IconButtonStyleType,
  IconButtonHierarchy,
  IconButtonSize,
} from './Icon';
