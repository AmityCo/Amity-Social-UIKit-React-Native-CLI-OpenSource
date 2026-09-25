// NotificationModeRow — RN port of AmityUiKitWeb
// v4/chat/features/group/edit-notification/components/NotificationModeRow. A
// notification mode's title + description rendered inline (web used a <span>).
//
// NOTE: like web, this component is NOT wired into the feature — it is not
// re-exported from the components barrel and is rendered nowhere. It exists to
// mirror the web tree 1:1 (it is a tracked port unit).
//
// RN adaptations from web:
//   - `<span>` → View; Typography.BodyBold → variant "bodyBold"; Typography.Caption
//     → variant "caption".

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../core/design/components/Typography';
import { useStyles } from './styles';

// 3. Types
type NotificationModeRowProps = {
  title: string;
  description: string;
};

// 4. Named function component
export function NotificationModeRow({
  title,
  description,
}: NotificationModeRowProps) {
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
