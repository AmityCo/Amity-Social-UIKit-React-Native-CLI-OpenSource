import { ReactNode } from 'react';
import { View } from 'react-native';
import MenuButton from '../../../../../elements/MenuButton';
import MenuAction from '../../../../../elements/MenuAction';
import { CopyLinkAction } from '../../../../../elements/CopyLinkAction';
import { ShareAction } from '../../../../../elements/ShareAction';
import { PageID } from '../../../../../enums';
import { useMenu } from './hooks/useMenu';

type MenuProps = {
  userId?: string;
  displayName?: string;
};

export function Menu({ userId, displayName }: MenuProps) {
  const {
    actions,
    shareLink,
    menuButtonId,
    openBottomSheet,
    bottomSheetHeight,
  } = useMenu({ userId, displayName });

  const items: { visible: boolean; action: ReactNode }[] = [
    ...actions.map(({ visible, ...action }) => ({
      visible,
      action: <MenuAction gap="small" {...action} key={action.label} />,
    })),
    {
      visible: !!shareLink,
      action: (
        <CopyLinkAction
          key="copy"
          link={shareLink ?? ''}
          pageId={PageID.user_profile_page}
        />
      ),
    },
    {
      visible: !!shareLink,
      action: (
        <ShareAction
          key="share"
          link={shareLink ?? ''}
          pageId={PageID.user_profile_page}
        />
      ),
    },
  ].filter(({ visible }) => visible);

  return (
    <MenuButton
      testID={menuButtonId}
      accessibilityLabel="User profile menu"
      onPress={() => {
        openBottomSheet({
          height: bottomSheetHeight[items.length],
          content: <View>{items.map(({ action }) => action)}</View>,
        });
      }}
    />
  );
}
