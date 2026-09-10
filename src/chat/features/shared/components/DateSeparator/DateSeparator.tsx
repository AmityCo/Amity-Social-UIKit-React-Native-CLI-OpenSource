// DateSeparator — ported from AmityUiKitWeb features/shared/components/DateSeparator.
// A centered date pill shown between message groups. Web div→View, span→Typography.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { useStyles } from './styles';

// 3. Types
type DateSeparatorProps = {
  label: string;
};

// 4. Named function component
export function DateSeparator({ label }: DateSeparatorProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.dateSeparator} accessibilityRole="text">
      <View style={styles.pill}>
        <Typography variant="caption" style={styles.label}>
          {label}
        </Typography>
      </View>
    </View>
  );
}
