// FailedToShow — ported from AmityUiKitWeb features/shared/components/FailedToShow.
// A centered icon + title + description shown when content can't be displayed.
// Web `className` (CSS-module override) → RN `style` prop, applied after the base
// container style. `flex: 1 1 auto` → flex:1 fill + center.
//
// The default copy is the generic livestream-unavailable pair ("Something went
// wrong" / "The content you're looking for is unavailable."). A caller that knows
// what the content was can pass a narrower line — the report sheet says "message"
// rather than "content" (PDT-5229).

// 1. React / RN imports
import { View, type StyleProp, type ViewStyle } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type FailedToShowProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;
  description?: string;
};

// 4. Named function component
export function FailedToShow({ style, title, description }: FailedToShowProps) {
  const { styles } = useStyles();
  const defaultTitle = useString(
    'amity_social_label_livestream_deleted_page_title'
  );
  const defaultDescription = useString(
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
        {title ?? defaultTitle}
      </Typography>
      <Typography variant="body" style={styles.desc}>
        {description ?? defaultDescription}
      </Typography>
    </View>
  );
}
