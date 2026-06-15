import { View } from 'react-native';
import { useStyles } from './styles';
import BackButton from '../../../../../elements/BackButton';
import { Title } from '../../../../../elements';
import { ElementID, PageID } from '../../../../../enums';

type TopBarProps = {
  onCancel?: () => void;
  disabled?: boolean;
};

export function TopBar({ onCancel, disabled }: TopBarProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <BackButton
        disabled={disabled}
        pageId={PageID.create_user_profile_page}
        onPress={onCancel}
      />
      <Title
        style={styles.title}
        pageId={PageID.create_user_profile_page}
        elementId={ElementID.title}
      />
      <View style={styles.dummy} />
    </View>
  );
}
