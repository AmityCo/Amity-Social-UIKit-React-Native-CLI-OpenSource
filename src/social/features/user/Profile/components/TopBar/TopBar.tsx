import { View } from 'react-native';
import MenuAction from '../../../../../elements/MenuAction';
import BackButton from '../../../../../elements/BackButton';
import MenuButton from '../../../../../elements/MenuButton';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useTopBar } from './hooks/useTopBar';

type TopBarProps = {
  userId?: string;
  isFromComponent?: boolean;
  isShowBackButton?: boolean;
  isShownDisplayName?: boolean;
  displayName?: string;
};

export function TopBar({
  userId,
  displayName,
  isFromComponent,
  isShowBackButton,
  isShownDisplayName,
}: TopBarProps) {
  const {
    styles,
    actions,
    openBottomSheet,
    bottomSheetHeight,
    handleGoBack,
    backButtonId,
    menuButtonId,
  } = useTopBar({ userId, displayName, isFromComponent });

  return (
    <View style={styles.container}>
      {isShowBackButton ? (
        <BackButton testID={backButtonId} onPress={handleGoBack} />
      ) : (
        <View />
      )}
      {isShownDisplayName && (
        <Typography.TitleBold
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.displayName}
        >
          {displayName}
        </Typography.TitleBold>
      )}
      <MenuButton
        accessibilityLabel="User profile menu"
        testID={menuButtonId}
        onPress={() => {
          openBottomSheet({
            height: bottomSheetHeight[actions.length],
            content: (
              <View>
                {actions.map((action) => (
                  <MenuAction gap="small" {...action} key={action.label} />
                ))}
              </View>
            ),
          });
        }}
      />
    </View>
  );
}
