// CreateGroupChat — entry component for the create-group step. Ported from
// AmityUiKitWeb v4/chat/features/group/create/CreateGroupChat. Composes the
// Header (title + Create) over the avatar picker, group-name field, privacy
// chooser, and member grid.
//
// RN adaptations from web:
//   - Web wraps everything in a scrolling `<form onSubmit>`; RN uses a fixed
//     Header over a ScrollView, with `handleCreate` wired to the Header's Create
//     button.
//   - The RN AvatarPicker is presentational (`imageUrl`/`onPick`/`isUploading`),
//     so it is driven by the hook's avatar state rather than a <Controller>.

// 1. React / RN imports
import { ScrollView, View } from 'react-native';

// 2. Third-party imports
import { Controller } from 'react-hook-form';

// 3. Internal imports (relative)
import { AvatarPicker } from '../../../elements/AvatarPicker';
import { GroupNameField } from '../../../elements/GroupNameField';
import { Header } from './components/Header/Header';
import { MemberGrid } from './components/MemberGrid/MemberGrid';
import { PrivacySection } from './components/PrivacySection/PrivacySection';
import {
  useCreateGroupChat,
  type CreateGroupChatPageProps,
} from './hooks/useCreateGroupChat';
import { useStyles } from './styles';

// 4. Named function component
export function CreateGroupChat({ selectedUsers }: CreateGroupChatPageProps) {
  const { styles } = useStyles();
  const {
    form,
    currentUser,
    avatarImageUrl,
    isUploadingAvatar,
    handlePickAvatar,
    handleClose,
    handleAddMember,
    handleCreate,
    isFormValid,
  } = useCreateGroupChat({ selectedUsers });

  return (
    <View style={styles.createGroupChat}>
      <Header
        isFormValid={isFormValid}
        onClose={handleClose}
        onCreate={handleCreate}
      />
      <ScrollView>
        <View style={styles.avatarWrapper}>
          <AvatarPicker
            imageUrl={avatarImageUrl}
            onPick={handlePickAvatar}
            isUploading={isUploadingAvatar}
          />
        </View>
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <GroupNameField value={value} onChange={onChange} optional />
          )}
        />
        <Controller
          control={form.control}
          name="isPublic"
          render={({ field: { onChange, value } }) => (
            <PrivacySection isPublic={value} onChange={onChange} />
          )}
        />
        <Controller
          control={form.control}
          name="members"
          render={({ field }) => (
            <MemberGrid
              currentUser={currentUser}
              members={field.value}
              onAddMember={handleAddMember}
              onRemoveMember={(userId) =>
                field.onChange(
                  field.value.filter((user) => user.userId !== userId)
                )
              }
            />
          )}
        />
      </ScrollView>
    </View>
  );
}
