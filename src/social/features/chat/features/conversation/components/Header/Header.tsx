// Header — conversation thread top bar, ported from AmityUiKitWeb
// features/conversation/chat/components/Header. Spine version: back button + name.
// Avatar, online/waiting-for-network subtitle and the conversation action menu
// layer on in later M2 tasks.

// 1. React / RN imports
import { Pressable, Text, View } from 'react-native';

// 2. Internal imports
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  title: string;
  onBack: () => void;
};

// 4. Named function component
export function Header({ title, onBack }: HeaderProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <AmityIcon
          name="chevron-left"
          size={24}
          tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
        />
      </Pressable>
      <View style={styles.identity}>
        <Text style={styles.name} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}
