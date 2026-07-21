// MemberPermission — a single permission option's title + description, ported from
// AmityUiKitWeb v4/chat/features/group/edit-permission/components/MemberPermission.
// Rendered as the label content of a Selection.Radio row.
//
// RN adaptations from web:
//   - `<span>` → View; Typography.BodyBold → variant "bodyBold"; Typography.Caption
//     → variant "caption".

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type MemberPermissionProps = {
  titleKey: string;
  descriptionKey: string;
};

// 4. Named function component
export function MemberPermission({
  titleKey,
  descriptionKey,
}: MemberPermissionProps) {
  const { styles } = useStyles();
  const title = useString(titleKey);
  const description = useString(descriptionKey);

  return (
    <View style={styles.container}>
      <Typography variant="bodyBold" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="caption" style={styles.description}>
        {description}
      </Typography>
    </View>
  );
}
