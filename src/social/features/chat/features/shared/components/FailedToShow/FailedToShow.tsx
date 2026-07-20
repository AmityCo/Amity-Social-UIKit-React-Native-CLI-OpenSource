// FailedToShow — ported from AmityUiKitWeb features/shared/components/FailedToShow.
// A centered icon + title + description shown when content can't be displayed.
// Web `className` (CSS-module override) → RN `style` prop, applied after the base
// container style. `flex: 1 1 auto` → flex:1 fill + center.

// 1. React / RN imports
import { View, type StyleProp, type ViewStyle } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type FailedToShowProps = {
  style?: StyleProp<ViewStyle>;
};

// 4. Named function component
export function FailedToShow({ style }: FailedToShowProps) {
  const { styles } = useStyles();
  const title = useString('amity_social_label_livestream_deleted_page_title');
  const description = useString(
    'amity_social_button_livestream_unavailable_desc'
  );

  return (
    <View style={[styles.failedToShow, style]}>
      <AmityIcon
        name="newspaper-question-l"
        size={64}
        tokenColor={AmityColorToken.IconEmptyStateIconDefault}
      />
      <Typography variant="titleBold" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" style={styles.desc}>
        {description}
      </Typography>
    </View>
  );
}
