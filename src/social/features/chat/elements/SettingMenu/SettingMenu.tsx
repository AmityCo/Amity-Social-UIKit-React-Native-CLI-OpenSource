// SettingMenu element — ported from AmityUiKitWeb chat/elements/SettingMenu.
// A single tappable settings row: leading icon-badge + label on the left, an
// optional trailing text + chevron on the right. A `destructive` row instead
// renders just a bold destructive-coloured label (e.g. "Leave group").
//
// RN adaptation from web: web's `icon?: React.ElementType` cannot cross the RN
// icon system (SoT SVGs rendered by name), so it becomes `iconName?: AmityIconName`.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../core/design/components/Typography';
import {
  AmityIcon,
  type AmityIconName,
} from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
export type SettingMenuProps = {
  /** SoT icon name for the leading icon-badge (web `icon: React.ElementType`). */
  iconName?: AmityIconName;
  label: string;
  trailingText?: string;
  destructive?: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
};

// 4. Named function component
export function SettingMenu({
  iconName,
  label,
  trailingText,
  destructive = false,
  accessibilityLabel,
  onPress,
}: SettingMenuProps) {
  const { styles } = useStyles();

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {destructive ? (
        <Typography variant="bodyBold" style={styles.destructiveLabel}>
          {label}
        </Typography>
      ) : (
        <>
          <View style={styles.leading}>
            {iconName ? (
              <View style={styles.iconBadge}>
                <AmityIcon
                  name={iconName}
                  size={24}
                  tokenColor={AmityColorToken.IconFeaturedIconTinted}
                />
              </View>
            ) : null}
            <Typography variant="body" style={styles.label} numberOfLines={1}>
              {label}
            </Typography>
          </View>
          <View style={styles.trailing}>
            {trailingText ? (
              <Typography variant="body" style={styles.trailingText}>
                {trailingText}
              </Typography>
            ) : null}
            <AmityIcon
              name="chevron-right"
              size={24}
              tokenColor={AmityColorToken.IconListLeadingDefaultDefault}
            />
          </View>
        </>
      )}
    </Pressable>
  );
}
