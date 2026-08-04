// EditGroupProfile — edit-group-profile screen, ported from AmityUiKitWeb
// v4/chat/features/group/edit-profile/EditGroupProfile. Header (with Save) over an
// AvatarPicker and a GroupNameField.
//
// RN adaptations from web:
//   - Web wrapped the fields in a `react-hook-form` `<form>` + `Controller`s; RN
//     drives the fields from plain state exposed by `useEditGroupProfile`.
//   - `<div>` → View. The AvatarPicker is presentational: it shows `imageUrl` and
//     delegates the pick to `onPick` (the hook launches the library + uploads).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { useString } from '../../../../core/localization';
import { AvatarPicker } from '../../../elements/AvatarPicker';
import { GroupNameField } from '../../../elements/GroupNameField';
import { Header } from './components/Header/Header';
import {
  useEditGroupProfile,
  type EditGroupProfileProps,
} from './hooks/useEditGroupProfile';
import { useStyles } from './styles';

// 3. Named function component
export function EditGroupProfile({ channelId }: EditGroupProfileProps) {
  const { styles } = useStyles();
  const {
    name,
    onChangeName,
    imageUrl,
    isUploading,
    isFormValid,
    handlePickAvatar,
    handleClose,
    handleSave,
  } = useEditGroupProfile({ channelId });

  const namePlaceholder = useString(
    'amity_chat_edit_group_profile_name_placeholder'
  );

  return (
    <View style={styles.container}>
      <Header
        isFormValid={isFormValid}
        onClose={handleClose}
        onSave={handleSave}
      />
      <View style={styles.avatarWrapper}>
        <AvatarPicker
          imageUrl={imageUrl}
          onPick={handlePickAvatar}
          isUploading={isUploading}
        />
      </View>
      <GroupNameField
        required
        value={name}
        onChange={onChangeName}
        placeholder={namePlaceholder}
      />
    </View>
  );
}
