import { View } from 'react-native';
import { useStyles } from './styles';
import { Button } from '../../../../../components/Button';
import { Title } from '../../../../../elements';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { ElementID, PageID } from '../../../../../enums';

type TopBarProps = {
  onCancel?: () => void;
};

export function TopBar({ onCancel }: TopBarProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      {onCancel ? (
        <Button type="inline" style={styles.cancelButton} onPress={onCancel}>
          <Typography.Body style={styles.cancelLabel}>Cancel</Typography.Body>
        </Button>
      ) : (
        <View style={styles.dummy} />
      )}
      <Title
        style={styles.title}
        pageId={PageID.create_user_profile_page}
        elementId={ElementID.title}
      >
        Create Profile
      </Title>
      <View style={styles.dummy} />
    </View>
  );
}
