import { View } from 'react-native';
import BackButton from '../../../../../elements/BackButton';
import CloseButton from '../../../../../elements/CloseButton';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { ComponentID, PageID } from '../../../../../enums';
import { useStyles } from './styles';

type HeaderProps = {
  title: string;
  closeLabel: string;
  showBackButton: boolean;
  disabled?: boolean;
  pageId: PageID;
  componentId: ComponentID;
  onBack: () => void;
  onClose: () => void;
};

export function Header({
  title,
  closeLabel,
  showBackButton,
  disabled,
  pageId,
  componentId,
  onBack,
  onClose,
}: HeaderProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <View style={[styles.slot, styles.leftSlot]}>
        {showBackButton && (
          <BackButton
            pageId={pageId}
            componentId={componentId}
            disabled={disabled}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
          />
        )}
      </View>
      <View style={[styles.slot, styles.centerSlot]}>
        <Typography.TitleBold numberOfLines={1} style={styles.title}>
          {title}
        </Typography.TitleBold>
      </View>
      <View style={[styles.slot, styles.rightSlot]}>
        <CloseButton
          pageId={pageId}
          componentId={componentId}
          hitSlop={12}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
      </View>
    </View>
  );
}
