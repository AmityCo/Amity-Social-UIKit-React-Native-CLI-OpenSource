// EditGroupMemberPermissions — messaging-permission screen, ported from AmityUiKitWeb
// v4/chat/features/group/edit-permission/EditGroupMemberPermissions. A TopBar (with
// Save) over a section of radio options (Everyone / Moderators only).
//
// RN adaptations from web:
//   - Web wrapped the radios in `react-hook-form` `Controller` +
//     `Selection.RadioGroup`; RN has no RadioGroup wrapper (group state is owned by
//     the parent), so the selection is driven by `useEditGroupMemberPermissions`
//     and each `Selection.Radio` fires `onSelect`.
//   - `<form>`/`<div>` → View; the web submit button becomes a Button whose
//     `onPress` calls `handleSave` (hierarchy "tertiary" = ghost/primary).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Button } from '../../../../../../core/design/atoms/Button';
import { Selection } from '../../../../../../core/design/atoms/Selection';
import { Typography } from '../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../core/localization';
import { TopBar } from '../../../elements/TopBar';
import { MemberPermission } from './components/MemberPermission/MemberPermission';
import { MESSAGING_PERMISSIONS } from './constants';
import {
  useEditGroupMemberPermissions,
  type EditGroupMemberPermissionsProps,
} from './hooks/useEditGroupMemberPermissions';
import { useStyles } from './styles';

// 3. Named function component
export function EditGroupMemberPermissions({
  channelId,
}: EditGroupMemberPermissionsProps) {
  const { styles } = useStyles();
  const { permission, setPermission, isFormValid, handleClose, handleSave } =
    useEditGroupMemberPermissions({ channelId });

  const pageTitle = useString(
    'amity_chat_group_member_permissions_navbar_title'
  );
  const saveLabel = useString('amity_chat_group_edit_permission_save');
  const messagingSection = useString(
    'amity_chat_group_edit_permissions_messaging_title'
  );

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
      <Typography variant="titleBold" style={styles.sectionTitle}>
        {messagingSection}
      </Typography>
      <View style={styles.radios}>
        {MESSAGING_PERMISSIONS.map((mode) => (
          <Selection.Radio
            key={mode.value}
            isSelected={permission === mode.value}
            onSelect={() => setPermission(mode.value)}
            accessibilityLabel={pageTitle}
          >
            <MemberPermission
              titleKey={mode.titleKey}
              descriptionKey={mode.descriptionKey}
            />
          </Selection.Radio>
        ))}
      </View>
    </View>
  );
}
