import { View } from 'react-native';
import BackButton from '../../../../../elements/BackButton';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useTopBar } from './hooks/useTopBar';
import { Menu } from '../../elements';

type TopBarProps = {
  userId?: string;
  inline?: boolean;
  isShownDisplayName?: boolean;
  displayName?: string;
};

export function TopBar({
  userId,
  displayName,
  inline,
  isShownDisplayName,
}: TopBarProps) {
  const { styles, handleGoBack, backButtonId } = useTopBar({ inline });

  return (
    <View style={styles.container}>
      <BackButton testID={backButtonId} onPress={handleGoBack} />
      {isShownDisplayName && (
        <Typography.TitleBold
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.displayName}
        >
          {displayName}
        </Typography.TitleBold>
      )}
      <Menu userId={userId} displayName={displayName} />
    </View>
  );
}
