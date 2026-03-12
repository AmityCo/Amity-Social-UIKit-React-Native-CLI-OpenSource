import { View } from 'react-native';
import { ReactNode } from 'react';
import MenuAction from '../../../../../elements/MenuAction';
import BackButton from '../../../../../elements/BackButton';
import MenuButton from '../../../../../elements/MenuButton';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useTopBar } from './hooks/useTopBar';
import { CopyLinkAction } from '../../../../../elements/CopyLinkAction';
import { ShareAction } from '../../../../../elements/ShareAction';
import { PageID } from '../../../../../enums';

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
    shareLink,
    openBottomSheet,
    bottomSheetHeight,
    handleGoBack,
    backButtonId,
    menuButtonId,
  } = useTopBar({ userId, displayName, isFromComponent });

  const menuActions: { show: boolean; action: ReactNode }[] = [
    ...actions.map((action) => ({
      show: true,
      action: <MenuAction gap="small" {...action} key={action.label} />,
    })),
    {
      show: !!shareLink,
      action: (
        <CopyLinkAction
          key="copy"
          link={shareLink ?? ''}
          pageId={PageID.user_profile_page}
        />
      ),
    },
    {
      show: !!shareLink,
      action: (
        <ShareAction
          key="share"
          link={shareLink ?? ''}
          pageId={PageID.user_profile_page}
        />
      ),
    },
  ].filter(({ show }) => show);

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
            height: bottomSheetHeight[menuActions.length],
            content: <View>{menuActions.map(({ action }) => action)}</View>,
          });
        }}
      />
    </View>
  );
}
