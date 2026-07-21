// EditGroupNotification — RN port of AmityUiKitWeb
// v4/chat/features/group/edit-notification/EditGroupNotification. A TopBar (with a
// Save action) over a radio group of notification modes (default / silent /
// subscribe), each rendering a title + description.
//
// RN adaptations from web:
//   - `<form>`/`<div>` → View; the web submit `Button.Main` (ghost/primary) → the
//     RN Button (hierarchy "tertiary" = ghost, tone "default" = primary) whose
//     `onPress` calls `handleSave`.
//   - Web wrapped the radios in `Selection.RadioGroup`; RN has no RadioGroup, so
//     the react-hook-form `Controller` drives each `Selection.Radio` via
//     `field.value`/`field.onChange` directly (the sibling edit-permission port's
//     pattern).
//   - All eight strings are resolved here (as on web) and the resolved title /
//     description are passed into `NotificationMode`.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Third-party imports
import { AmityChannelNotificationModeEnum } from '@amityco/ts-sdk-react-native';
import { Controller } from 'react-hook-form';

// 3. Internal imports (relative)
import { Button } from '../../../../../../core/design/atoms/Button';
import { Selection } from '../../../../../../core/design/atoms/Selection';
import { useString } from '../../../../../../core/localization';
import { TopBar } from '../../../elements/TopBar';
import { NotificationMode } from './components/NotificationMode/NotificationMode';
import {
  useEditGroupNotification,
  type EditGroupNotificationProps,
} from './hooks/useEditGroupNotification';
import { useStyles } from './styles';

// 4. Named function component
export function EditGroupNotification({
  channelId,
}: EditGroupNotificationProps) {
  const { styles } = useStyles();
  const { control, handleClose, handleSave, isFormValid } =
    useEditGroupNotification({ channelId });

  const pageTitle = useString('amity_chat_group_notifications');
  const saveLabel = useString('amity_chat_group_edit_notification_save');
  const defaultModeTitle = useString(
    'amity_chat_group_notification_default_title'
  );
  const defaultModeDesc = useString(
    'amity_chat_group_notification_default_desc'
  );
  const silentModeTitle = useString(
    'amity_chat_group_notification_silent_title'
  );
  const silentModeDesc = useString('amity_chat_group_notification_silent_desc');
  const subscribeModeTitle = useString(
    'amity_chat_group_notification_subscribe_title'
  );
  const subscribeModeDesc = useString(
    'amity_chat_group_notification_subscribe_desc'
  );

  const notificationModes = [
    {
      value: AmityChannelNotificationModeEnum.Default,
      title: defaultModeTitle,
      description: defaultModeDesc,
    },
    {
      value: AmityChannelNotificationModeEnum.Silent,
      title: silentModeTitle,
      description: silentModeDesc,
    },
    {
      value: AmityChannelNotificationModeEnum.Subscribe,
      title: subscribeModeTitle,
      description: subscribeModeDesc,
    },
  ];

  return (
    <View style={styles.container}>
      <TopBar
        title={pageTitle}
        leadingType="back"
        onLeading={handleClose}
        trailing={
          <Button
            hierarchy="tertiary"
            tone="default"
            size="sm"
            label={saveLabel}
            disabled={!isFormValid}
            onPress={handleSave}
          />
        }
      />
      <Controller
        control={control}
        name="notificationMode"
        render={({ field: { value, onChange } }) => (
          <View style={styles.radios}>
            {notificationModes.map((mode) => (
              <Selection.Radio
                key={mode.value}
                isSelected={value === mode.value}
                onSelect={() => onChange(mode.value)}
                accessibilityLabel={pageTitle}
              >
                <NotificationMode
                  title={mode.title}
                  description={mode.description}
                />
              </Selection.Radio>
            ))}
          </View>
        )}
      />
    </View>
  );
}
