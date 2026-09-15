// Typography component — ported from AmityUiKitWeb core/components/Typography.
// Web renders <h1>/<p>/<span> with a per-variant CSS class; here every variant
// renders an RN <Text>. Metrics come from the SoT type scale (Web column) in
// tokens/geometry.json; default color from the Text/Base/Default token.

import { Text, type TextProps } from 'react-native';
import { useStyles } from './styles';

export type TypographyVariant =
  | 'headline'
  | 'titleBold'
  | 'title'
  | 'bodyBold'
  | 'body'
  | 'captionBold'
  | 'caption'
  | 'captionSmall';

export type TypographyProps = TextProps & {
  variant?: TypographyVariant;
};

export function Typography({
  variant = 'body',
  style,
  children,
  ...rest
}: TypographyProps) {
  const { styles } = useStyles();

  // Caller `style` is applied after the variant style so overrides win,
  // preserving the web `color: inherit` re-tint behaviour.
  return (
    <Text style={[styles[variant], style]} {...rest}>
      {children}
    </Text>
  );
}
