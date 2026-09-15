// NotificationMode — RN port of AmityUiKitWeb
// v4/chat/features/group/edit-notification/components/NotificationMode. A single
// notification mode's title + description, rendered as a Selection.Radio label.
//
// RN adaptations from web:
//   - `<div>` → View; Typography.BodyBold → variant "bodyBold"; Typography.Caption
//     → variant "caption". Strings are resolved by the parent and passed in.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../core/design/components/Typography';
import { useStyles } from './styles';

// 3. Types
type NotificationModeProps = {
  title: string;
  description: string;
};

// 4. Named function component
export function NotificationMode({
  title,
  description,
}: NotificationModeProps) {
  const { styles } = useStyles();

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
