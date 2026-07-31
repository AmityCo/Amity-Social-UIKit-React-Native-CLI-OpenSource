// Avatar atom — ported from AmityUiKitWeb core/design/atoms/Avatar.
// Profile avatar: image / initials / user-icon fallback, rounded or squared,
// 8 intrinsic sizes (SoT avatarIcon.avatar.sizes), optional profile border ring,
// indicator badge slot and label. Web hover edit-photo affordance is web-only
// (no touch-hover, no matching RN token) and is intentionally omitted.

// 1. React / RN imports
import { type ReactNode } from 'react';
import { View, Text, Image, Pressable } from 'react-native';

// 2. Internal imports
import { AmityIcon } from '../../icons';
import { useStyles } from './styles';

// 3. Types
export type AvatarVariant = 'image' | 'icon' | 'text';
export type AvatarShape = 'rounded' | 'squared';
export type AvatarSize = 16 | 24 | 28 | 32 | 40 | 56 | 64 | 120;
export type AvatarState = 'default' | 'skeleton';
export type AvatarBorderWidth = 0 | 1 | 2 | 3 | 4;

export type AvatarProps = {
  variant?: AvatarVariant;
  imageUrl?: string;
  initials?: string;
  shape?: AvatarShape;
  size?: AvatarSize;
  state?: AvatarState;
  borderWidth?: AvatarBorderWidth;
  indicator?: ReactNode;
  label?: string;
  onPress?: () => void;
};

// 4. Named function component
export function Avatar({
  variant = 'icon',
  imageUrl,
  initials,
  shape = 'rounded',
  size = 40,
  state = 'default',
  borderWidth = 0,
  indicator,
  label,
  onPress,
}: AvatarProps) {
  const { styles, glyphSize, glyphColor } = useStyles(
    size,
    shape,
    state,
    borderWidth
  );

  let content: ReactNode = null;
  if (state !== 'skeleton') {
    if (variant === 'image' && imageUrl) {
      content = (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    } else if (variant === 'text' && initials) {
      content = <Text style={styles.initials}>{initials}</Text>;
    } else {
      // PDT-3912 (web b5df56286): the fallback glyph is the SOLID user icon
      // (User.Regular → User.Solid in web's core Avatar).
      content = (
        <AmityIcon name="user-s" size={glyphSize} tokenColor={glyphColor} />
      );
    }
  }

  const frame = <View style={styles.frame}>{content}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.frameWrapper}>
        {onPress ? (
          <Pressable onPress={onPress} accessibilityRole="button">
            {frame}
          </Pressable>
        ) : (
          frame
        )}
        {indicator ? <View style={styles.indicator}>{indicator}</View> : null}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}
